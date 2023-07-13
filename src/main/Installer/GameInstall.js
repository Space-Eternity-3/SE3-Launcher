const GameInstall = () => {
    return [
        new DownloadAction("url", "savePath"),
        new ExtractAction("savePath", "extractPath")
    ]
};
