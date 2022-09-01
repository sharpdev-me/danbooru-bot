import { writeFileSync } from "fs";

interface Logger {
    log: (data: any) => void;
}

export class FileLogger implements Logger {
    constructor(public path: string) { }
    public log = (data: any) => {
        writeFileSync(this.path, `[${new Date().toTimeString()}] ` + String(data) + "\n", {flag: "a"});
    }
}