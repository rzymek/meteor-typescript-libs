interface UploadServerStatic {
	init(config: {
		tmpDir?: string;
		uploadDir?: string;
		chcheckCreateDirectories?: boolean
	}) : void;
}

declare var UploadServer : UploadServerStatic;

declare var process : any;