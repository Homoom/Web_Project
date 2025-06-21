import { ExecutionLanguage, CodeExecution } from '../types';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEMP_DIR = path.join(__dirname, '../../temp');

export class CodeRunner {
  static async run(execution: CodeExecution): Promise<string> {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    const tempFile = path.join(TEMP_DIR, `exec_${Date.now()}.${this.getFileExtension(execution.language)}`);
    fs.writeFileSync(tempFile, execution.code);

    try {
      const output = await this.executeCode(tempFile, execution.language);
      return output;
    } finally {
      fs.unlinkSync(tempFile);
    }
  }

  private static getFileExtension(language: ExecutionLanguage): string {
    const extensions = {
      [ExecutionLanguage.JAVA]: 'java',
      [ExecutionLanguage.PYTHON]: 'py',
      [ExecutionLanguage.C]: 'c',
      [ExecutionLanguage.CPP]: 'cpp',
      [ExecutionLanguage.JAVASCRIPT]: 'js'
    };
    return extensions[language];
  }

  private static executeCode(filePath: string, language: ExecutionLanguage): Promise<string> {
    const commands = {
      [ExecutionLanguage.JAVA]: `javac ${filePath} && java ${filePath.replace('.java', '')}`,
      [ExecutionLanguage.PYTHON]: `python ${filePath}`,
      [ExecutionLanguage.C]: `gcc ${filePath} -o ${filePath.replace('.c', '')} && ${filePath.replace('.c', '')}`,
      [ExecutionLanguage.CPP]: `g++ ${filePath} -o ${filePath.replace('.cpp', '')} && ${filePath.replace('.cpp', '')}`,
      [ExecutionLanguage.JAVASCRIPT]: `node ${filePath}`
    };

    return new Promise((resolve, reject) => {
      exec(commands[language], (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}
