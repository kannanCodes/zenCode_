export interface IAiProvider {
  generateText(prompt: string): Promise<string>;
}
