import chalk from "chalk";
import moment from "moment";

export class Logger {
  // Helper function to get the timestamp in the format "HH:mm:ss"
  private static getTimestamp(): string {
    return moment().format("HH:mm:ss"); // Only hour:minute:second
  }

  // Function for info logs (green color)
  public static info(message: string | object | any[]): void {
    this.log("INFO", message, chalk.green);
  }

  // Function for warning logs (yellow color)
  public static warn(message: string | object | any[]): void {
    this.log("WARN", message, chalk.magenta);
  }

  // Function for error logs (red color)
  public static error(...message: string[] | object[] | any[]): void {
    this.log("ERROR", message.join(" "), chalk.red);
  }

  // Function for success logs (blue color)
  public static success(message: string | object | any[]): void {
    this.log("SUCCESS", message, chalk.cyan);
  }

  // Function for debug logs (magenta color)
  public static debug(message: string | object | any[]): void {
    this.log("DEBUG", message, chalk.yellow);
  }

  // Helper function to log messages
  private static log(
    level: string,
    message: string | object | any[],
    colorFn: (text: string) => string
  ): void {
    const timestamp = this.getTimestamp();
    let formattedMessage;

    // Check if message is an object or array
    if (typeof message === "object") {
      // Convert objects/arrays to JSON strings, pretty-printing for better readability
      formattedMessage = JSON.stringify(message, null, 2);
    } else {
      // If message is a string, use it as is
      formattedMessage = message;
    }

    // Log the message with the appropriate color and timestamp
    console.log(
      colorFn(
        `[${level}]`.padStart(9, ` `) + ` [${timestamp}] - ${formattedMessage}`
      )
    );
  }
}

export function chunkize<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

export function commatize(number: number) {
  let numStr = number.toString();
  let formattedNumber = "";

  for (let i = numStr.length - 1, count = 0; i >= 0; i--) {
    formattedNumber = numStr[i] + formattedNumber;
    count++;
    if (count % 3 === 0 && i !== 0) {
      formattedNumber = "," + formattedNumber;
    }
  }
  return formattedNumber;
}