package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"image"
	"image/gif"
	_ "image/jpeg"
	"image/png"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	_ "golang.org/x/image/bmp"
	_ "golang.org/x/image/tiff"
	_ "golang.org/x/image/webp"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx        context.Context
	initialArg string
}

// TargetInfo represents parsed CLI or dropped path target
type TargetInfo struct {
	Directory string `json:"directory"`
	FileName  string `json:"fileName"`
	IsFile    bool   `json:"isFile"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// GetInitialTarget returns target info based on initialArg or dropped path
func (a *App) GetInitialTarget(targetPath string) (*TargetInfo, error) {
	if targetPath == "" {
		targetPath = a.initialArg
	}

	if targetPath == "" {
		return &TargetInfo{}, nil
	}

	absPath, err := filepath.Abs(targetPath)
	if err != nil {
		absPath = targetPath
	}

	info, err := os.Stat(absPath)
	if err != nil {
		return nil, fmt.Errorf("path does not exist: %w", err)
	}

	if info.IsDir() {
		return &TargetInfo{
			Directory: absPath,
			IsFile:    false,
		}, nil
	}

	return &TargetInfo{
		Directory: filepath.Dir(absPath),
		FileName:  filepath.Base(absPath),
		IsFile:    true,
	}, nil
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

type DriveInfo struct {
	Path  string `json:"path"`
	Label string `json:"label"`
}

type TreeNode struct {
	Name        string `json:"name"`
	Path        string `json:"path"`
	HasChildren bool   `json:"hasChildren"`
}

type FileInfo struct {
	Name        string `json:"name"`
	Path        string `json:"path"`
	Size        int64  `json:"size"`
	ModTime     string `json:"modTime"`
	Extension   string `json:"extension"`
	Width       int    `json:"width"`
	Height      int    `json:"height"`
	IsGIF       bool   `json:"isGif"`
	IsDirectory bool   `json:"isDirectory"`
	FrameCount  int    `json:"frameCount"`
}

// GetDrives returns available drive letters or root mounts
func (a *App) GetDrives() ([]DriveInfo, error) {
	var drives []DriveInfo

	if runtime.GOOS == "windows" {
		for _, drive := range "ABCDEFGHIJKLMNOPQRSTUVWXYZ" {
			drivePath := string(drive) + ":\\"
			if _, err := os.Stat(drivePath); err == nil {
				drives = append(drives, DriveInfo{
					Path:  drivePath,
					Label: fmt.Sprintf("Local Disk (%c:)", drive),
				})
			}
		}
	} else {
		// Linux / macOS
		drives = append(drives, DriveInfo{
			Path:  "/",
			Label: "Root (/)",
		})
		// Check common mount paths
		mounts := []string{"/media", "/mnt", "/Volumes"}
		for _, m := range mounts {
			if entries, err := os.ReadDir(m); err == nil {
				for _, entry := range entries {
					if entry.IsDir() {
						fullPath := filepath.Join(m, entry.Name())
						drives = append(drives, DriveInfo{
							Path:  fullPath,
							Label: fmt.Sprintf("%s (%s)", entry.Name(), m),
						})
					}
				}
			}
		}
	}

	if len(drives) == 0 {
		home, err := os.UserHomeDir()
		if err == nil {
			drives = append(drives, DriveInfo{
				Path:  home,
				Label: "Home",
			})
		}
	}

	return drives, nil
}

// GetDirectories returns subdirectories in the given path
func (a *App) GetDirectories(dirPath string) ([]TreeNode, error) {
	if dirPath == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			dirPath = "/"
		} else {
			dirPath = home
		}
	}

	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory: %w", err)
	}

	// Skip system pseudo-directories on Linux
	skipDirs := map[string]bool{
		"proc": true, "sys": true, "dev": true, "run": true,
	}

	var nodes []TreeNode
	for _, entry := range entries {
		if entry.IsDir() {
			name := entry.Name()
			if dirPath == "/" && skipDirs[name] {
				continue
			}

			fullPath := filepath.Join(dirPath, name)
			nodes = append(nodes, TreeNode{
				Name:        name,
				Path:        fullPath,
				HasChildren: true, // Always allow expanding directories
			})
		}
	}

	return nodes, nil
}


// GetFilesInDirectory lists files matching active categories/extensions
func (a *App) GetFilesInDirectory(dirPath string, allowedTypes []string) ([]FileInfo, error) {
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory: %w", err)
	}

	typeMap := make(map[string]bool)
	for _, t := range allowedTypes {
		typeMap[strings.ToLower(t)] = true
	}

	var items []FileInfo

	// Include parent directory ".." if "folders" filter is checked and not at root
	if typeMap["folders"] {
		parentDir := filepath.Dir(dirPath)
		if parentDir != dirPath && parentDir != "" {
			items = append(items, FileInfo{
				Name:        "..",
				Path:        parentDir,
				IsDirectory: true,
				Extension:   "folder",
			})
		}
	}

	for _, entry := range entries {
		fullPath := filepath.Join(dirPath, entry.Name())

		if entry.IsDir() {
			if typeMap["folders"] {
				items = append(items, FileInfo{
					Name:        entry.Name(),
					Path:        fullPath,
					IsDirectory: true,
					Extension:   "folder",
				})
			}
			continue
		}

		ext := strings.ToLower(filepath.Ext(entry.Name()))
		if len(ext) > 0 && ext[0] == '.' {
			ext = ext[1:]
		}

		// Only include files matching app's designed media categories (imgs, gif, ico)
		matched := false
		if typeMap["img"] && (ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "webp") {
			matched = true
		}
		if typeMap["gif"] && ext == "gif" {
			matched = true
		}
		if typeMap["ico"] && ext == "ico" {
			matched = true
		}

		if matched {
			info, err := entry.Info()
			if err != nil {
				continue
			}

			fileItem := FileInfo{
				Name:      entry.Name(),
				Path:      fullPath,
				Size:      info.Size(),
				ModTime:   info.ModTime().Format("2006-01-02 15:04:05"),
				Extension: ext,
				IsGIF:     ext == "gif",
			}

			items = append(items, fileItem)
		}
	}

	return items, nil
}

type FileDetails struct {
	DataURL string `json:"dataUrl"`
	Width   int    `json:"width"`
	Height  int    `json:"height"`
}

// GetFileDetails reads file base64 data and image dimensions lazily
func (a *App) GetFileDetails(filePath string) (*FileDetails, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	ext := strings.ToLower(filepath.Ext(filePath))
	mimeType := "image/jpeg"
	switch ext {
	case ".png":
		mimeType = "image/png"
	case ".gif":
		mimeType = "image/gif"
	case ".webp":
		mimeType = "image/webp"
	case ".ico":
		mimeType = "image/x-icon"
	case ".jpg", ".jpeg":
		mimeType = "image/jpeg"
	}

	encoded := base64.StdEncoding.EncodeToString(data)
	dataURL := fmt.Sprintf("data:%s;base64,%s", mimeType, encoded)

	details := &FileDetails{
		DataURL: dataURL,
	}

	if f, err := os.Open(filePath); err == nil {
		if cfg, _, err := image.DecodeConfig(f); err == nil {
			details.Width = cfg.Width
			details.Height = cfg.Height
		}
		f.Close()
	}

	return details, nil
}

// GetFileBase64 reads a file and returns base64 string
func (a *App) GetFileBase64(filePath string) (string, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	ext := strings.ToLower(filepath.Ext(filePath))
	mimeType := "image/jpeg"
	switch ext {
	case ".png":
		mimeType = "image/png"
	case ".gif":
		mimeType = "image/gif"
	case ".webp":
		mimeType = "image/webp"
	case ".ico":
		mimeType = "image/x-icon"
	case ".jpg", ".jpeg":
		mimeType = "image/jpeg"
	}

	encoded := base64.StdEncoding.EncodeToString(data)
	return fmt.Sprintf("data:%s;base64,%s", mimeType, encoded), nil
}

// GetGIFFrames decodes a GIF file and extracts all frames as base64 PNG data URLs
func (a *App) GetGIFFrames(filePath string) ([]string, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open GIF: %w", err)
	}
	defer f.Close()

	g, err := gif.DecodeAll(f)
	if err != nil {
		return nil, fmt.Errorf("failed to decode GIF: %w", err)
	}

	var frames []string
	for _, img := range g.Image {
		var buf strings.Builder
		encoder := base64.NewEncoder(base64.StdEncoding, &buf)

		// Encode frame as PNG into base64
		if err := png.Encode(encoder, img); err != nil {
			encoder.Close()
			continue
		}
		encoder.Close()

		frames = append(frames, "data:image/png;base64,"+buf.String())
	}

	return frames, nil
}

// RenameFile renames a file on disk and returns the new full path
func (a *App) RenameFile(oldPath string, newName string) (string, error) {
	dir := filepath.Dir(oldPath)
	newPath := filepath.Join(dir, newName)

	if _, err := os.Stat(newPath); err == nil {
		return "", fmt.Errorf("a file with name %q already exists", newName)
	}

	if err := os.Rename(oldPath, newPath); err != nil {
		return "", fmt.Errorf("failed to rename file: %w", err)
	}

	return newPath, nil
}

// QuitApp exits the application
func (a *App) QuitApp() {
	wailsRuntime.Quit(a.ctx)
}
