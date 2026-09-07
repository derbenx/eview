package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestGetFilesInDirectory(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "eview_test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Create test files
	os.WriteFile(filepath.Join(tmpDir, "test1.jpg"), []byte("fake jpg"), 0644)
	os.WriteFile(filepath.Join(tmpDir, "test2.gif"), []byte("fake gif"), 0644)
	os.WriteFile(filepath.Join(tmpDir, "test3.txt"), []byte("fake txt"), 0644)

	app := NewApp()

	// Filter img
	files, err := app.GetFilesInDirectory(tmpDir, []string{"img"})
	if err != nil {
		t.Fatalf("GetFilesInDirectory failed: %v", err)
	}
	if len(files) != 1 || files[0].Name != "test1.jpg" {
		t.Errorf("Expected 1 img file (test1.jpg), got %v", files)
	}

	// Filter gif
	files, err = app.GetFilesInDirectory(tmpDir, []string{"gif"})
	if err != nil {
		t.Fatalf("GetFilesInDirectory failed: %v", err)
	}
	if len(files) != 1 || files[0].Name != "test2.gif" {
		t.Errorf("Expected 1 gif file (test2.gif), got %v", files)
	}

	// Filter img + gif
	files, err = app.GetFilesInDirectory(tmpDir, []string{"img", "gif"})
	if err != nil {
		t.Fatalf("GetFilesInDirectory failed: %v", err)
	}
	if len(files) != 2 {
		t.Errorf("Expected 2 files, got %d", len(files))
	}
}

func TestRenameFile(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "eview_test_rename")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	oldFile := filepath.Join(tmpDir, "old.png")
	os.WriteFile(oldFile, []byte("data"), 0644)

	app := NewApp()
	newPath, err := app.RenameFile(oldFile, "new.png")
	if err != nil {
		t.Fatalf("RenameFile failed: %v", err)
	}

	if filepath.Base(newPath) != "new.png" {
		t.Errorf("Expected new filename new.png, got %s", newPath)
	}

	if _, err := os.Stat(newPath); os.IsNotExist(err) {
		t.Errorf("File at new path does not exist")
	}
}
