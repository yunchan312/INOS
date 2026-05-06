import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4000;

@Injectable()
export class ClaudeService {
  private readonly client: Anthropic;

  constructor(private readonly config: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.config.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  async *streamText(prompt: string, system: string): AsyncGenerator<string> {
    try {
      const stream = await this.client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: [{ role: 'user', content: prompt }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: [{ type: 'web_search_20250305', name: 'web_search' }] as any,
        stream: true,
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield event.delta.text;
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Claude 스트리밍 오류: ${(error as Error).message}`,
      );
    }
  }

  async generateText(prompt: string, system: string): Promise<string> {
    try {
      const message = await this.client.messages.create({
        model: MODEL,
        max_tokens: 512,
        system,
        messages: [{ role: 'user', content: prompt }],
      });

      const block = message.content[0];
      return block.type === 'text' ? block.text : '';
    } catch (error) {
      throw new InternalServerErrorException(
        `Claude 텍스트 생성 오류: ${(error as Error).message}`,
      );
    }
  }
}
