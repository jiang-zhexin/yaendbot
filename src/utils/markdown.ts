import { MessageEntity } from "grammy/types";
import { lexer, type Token, type Tokens } from "marked";

type result = {
  text: string;
  entities: MessageEntity[];
};

export function Markdown(text: string): result {
  const tokens = lexer(text);
  return format(tokens);
}

function format(tokens: Token[], offset: number = 0): result {
  const result: result = { text: "", entities: [] };
  for (const token of tokens) {
    switch (token.type) {
      case "blockquote": {
        if (token.tokens === undefined) {
          console.log(token.raw);
          break;
        }
        const r = format(token.tokens, offset);
        result.entities.push(
          {
            type: "blockquote",
            offset: offset,
            length: r.text.length,
          },
          ...r.entities
        );
        result.text += r.text;
        offset += r.text.length;
        break;
      }
      case "heading": {
        if (token.tokens === undefined) {
          console.log(token.raw);
          break;
        }
        const r = format(token.tokens, offset);
        result.entities.push(
          {
            type: "bold",
            offset: offset,
            length: r.text.length,
          },
          ...r.entities
        );
        result.text += r.text + "\n\n";
        offset += r.text.length + 2;
        break;
      }
      case "strong":
      case "em": {
        if (token.tokens === undefined) {
          console.log(token.raw);
          break;
        }
        const r = format(token.tokens, offset);
        result.entities.push(
          {
            type: "bold",
            offset: offset,
            length: r.text.length,
          },
          ...r.entities
        );
        result.text += r.text;
        offset += r.text.length;
        break;
      }
      case "del": {
        if (token.tokens === undefined) {
          console.log(token.raw);
          break;
        }
        const r = format(token.tokens, offset);
        result.entities.push(
          {
            type: "strikethrough",
            offset: offset,
            length: r.text.length,
          },
          ...r.entities
        );
        result.text += r.text;
        offset += r.text.length;
        break;
      }
      case "link": {
        if (token.tokens === undefined) {
          console.log(token.raw);
          break;
        }
        const r = format(token.tokens, offset);
        result.entities.push(
          {
            type: "text_link",
            offset: offset,
            length: r.text.length,
            url: token.href,
          },
          ...r.entities
        );
        result.text += r.text;
        offset += r.text.length;
        break;
      }
      case "list": {
        const pre = token.ordered
          ? (function* (num: number) {
              while (true) {
                yield `${num++}. `;
              }
            })(token.start)
          : (function* () {
              while (true) {
                yield "• ";
              }
            })();
        for (const t of token.items as Tokens.ListItem[]) {
          const p = pre.next().value;
          const r = format(t.tokens, offset + p.length);
          result.entities.push(...r.entities);
          result.text += p + r.text + "\n";
          offset += r.text.length + p.length + 1;
        }
        break;
      }
      case "list_item": {
        if (token.tokens === undefined) {
          console.log(token.raw);
          break;
        }
        const r = format(token.tokens, offset);
        result.entities.push(...r.entities);
        result.text += r.text;
        offset += r.text.length;
        break;
      }
      case "paragraph": {
        if (token.tokens === undefined) {
          console.log(token.raw);
          break;
        }
        const r = format(token.tokens, offset);
        result.entities.push(...r.entities);
        result.text += r.text;
        offset += r.text.length;
        break;
      }
      case "text": {
        if (token.tokens === undefined) {
          result.text += token.raw;
          offset += token.raw.length;
          break;
        }
        const suffix = token.raw.length > token.text.length ? "\n" : "";
        const r = format(token.tokens, offset);
        result.entities.push(...r.entities);
        result.text += r.text + suffix;
        offset += r.text.length + suffix.length;
        break;
      }
      case "codespan": {
        result.entities.push({
          type: "code",
          offset: offset,
          length: token.text.length,
        });
        result.text += token.text;
        offset += token.text.length;
        break;
      }
      case "code": {
        result.entities.push({
          type: "pre",
          offset: offset,
          length: token.text.length,
          language: token.lang,
        });
        result.text += token.text;
        offset += token.text.length;
        break;
      }
      case "br":
        result.text += "\n";
        offset++;
        break;
      case "space":
        result.text += token.raw;
        offset += token.raw.length;
        break;
    }
  }
  return result;
}
