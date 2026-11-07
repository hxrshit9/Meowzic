export class Logger {
  private static formatTime(): string {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  public static info(message: string, context: string = 'Meowzic'): void {
    console.log(`[${this.formatTime()}] [INFO] [${context}] ${message}`);
  }

  public static success(message: string, context: string = 'Meowzic'): void {
    console.log(`[${this.formatTime()}] [SUCCESS] [${context}] 🐾 ${message}`);
  }

  public static warn(message: string, context: string = 'Meowzic'): void {
    console.warn(`[${this.formatTime()}] [WARN] [${context}] ⚠️ ${message}`);
  }

  public static error(message: string, error?: unknown, context: string = 'Meowzic'): void {
    console.error(`[${this.formatTime()}] [ERROR] [${context}] ❌ ${message}`);
    if (error) {
      console.error(error);
    }
  }

  public static debug(message: string, context: string = 'Meowzic'): void {
    if (process.env.DEBUG === 'true') {
      console.log(`[${this.formatTime()}] [DEBUG] [${context}] 🔍 ${message}`);
    }
  }
}
