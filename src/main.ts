import type {
  Plugin,
  ResolvedConfig,
  ResolvedServerOptions,
  ServerOptions,
} from 'vite';
import qrcode from 'qrcode-terminal';
import { getAllHost } from './util';
export interface PluginOption {
  content?: string;
  small?: boolean;
}
import chalk from 'chalk';

const allHost = getAllHost();

export function vitePluginQrcodeTerminal(params: PluginOption = {}): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'vite-plugin-qrcode-terminal',
    apply: 'serve',
    enforce: 'post',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        createQrcode(params, config.server);
        next();
      });
    },
  };
}

function createQrcode(
  params: PluginOption,
  server: ServerOptions & ResolvedServerOptions
) {
  const { small } = params;
  const content = getInputContent(params, server);
  const urls = renderUrl(content, server);
  urls.forEach((each) => {
    qrcode.generate(each, { small: small ?? true }, (qrcode) => {
      console.log(('------------qrcode------------'));
      console.log(`${chalk.green('[url]')} ${chalk.blue(each)} `);
      console.log(qrcode);
    });
  });
}

function getInputContent(
  params: PluginOption,
  server: ServerOptions & ResolvedServerOptions
): string[] {
  const { content } = params;
  const { host } = server;

  let input: string[] = [];

  if (content) {
    input = [content];
  } else {
    if (typeof host === 'boolean') {
      input = host ? allHost : ['localhost'];
    }

    if (typeof host === 'string') {
      input = host === '0.0.0.0' ? allHost : [host];
    }

    if (host === undefined) {
      input = ['localhost'];
    }
  }
  return input;
}

function renderUrl(
  input: string[],
  server: ServerOptions & ResolvedServerOptions
) {
  const { https, port, open } = server;
  const protocol = https ? 'https://' : 'http://';
  const postUrl = typeof open === 'string' ? open : '';
  return input.map((item) => {
    return postUrl.startsWith('/')
      ? `${protocol}${item}:${port}${postUrl}`
      : `${protocol}${item}:${port}/${postUrl}`;
  });
}
