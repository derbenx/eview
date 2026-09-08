package main

import (
	"context"
	"embed"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	if len(os.Args) > 1 {
		app.initialArg = os.Args[1]
	}

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "eview",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			// Listen for file drop events if enabled in runtime or custom drag/drop in frontend
			wailsRuntime.EventsOn(ctx, "drag-drop-file", func(optionalData ...interface{}) {
				if len(optionalData) > 0 {
					if path, ok := optionalData[0].(string); ok {
						_ = path
					}
				}
			})
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
