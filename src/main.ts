import { mountApp } from './app.ts';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('Elemento #app não encontrado.');
}

mountApp(root);
