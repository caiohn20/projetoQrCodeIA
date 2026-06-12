# QR Generator

## Purpose

Ferramenta web client-side para gerar QR Codes a partir de texto livre, exportar PNG e expor representações técnicas (base64, bytes PNG, bitmap RGBA) para integração em outras aplicações. Sem leitor de QR, sem backend.

## Requirements

### Requirement: Geração de QR a partir de texto

O sistema SHALL gerar um QR Code PNG a partir de uma string não vazia informada pelo usuário, usando a biblioteca `qrcode` com defaults fixos (correção M, margin 4, preto/branco).

#### Scenario: Texto válido gera preview

- **WHEN** o usuário digita ou cola texto não vazio no campo de entrada
- **THEN** o sistema exibe preview do QR Code em PNG após debounce (~300ms)

#### Scenario: Texto vazio não gera QR

- **WHEN** o campo de entrada está vazio ou contém apenas espaços
- **THEN** o sistema não exibe QR Code e desabilita ações de exportação

#### Scenario: Falha na geração registra erro

- **WHEN** a biblioteca `qrcode` falha ao processar o conteúdo
- **THEN** o sistema exibe mensagem inline legível e registra o erro no log

### Requirement: Exportação de imagem PNG

O sistema SHALL permitir baixar o QR Code atual como arquivo PNG e copiar a imagem para a área de transferência.

#### Scenario: Download PNG

- **WHEN** existe QR Code válido e o usuário clica em "Baixar PNG"
- **THEN** o sistema inicia download de arquivo `.png` com o QR atual

#### Scenario: Copiar imagem

- **WHEN** existe QR Code válido e o usuário clica em "Copiar imagem"
- **THEN** o sistema coloca `image/png` na área de transferência

#### Scenario: Ações desabilitadas sem QR

- **WHEN** não há QR Code válido gerado
- **THEN** os botões de download e copiar imagem permanecem desabilitados

### Requirement: Formatos avançados colapsáveis

O sistema SHALL expor base64, bytes e bitmap derivados do mesmo QR gerado, em seção colapsada por padrão.

#### Scenario: Seção inicia colapsada

- **WHEN** a página é carregada
- **THEN** a seção "Formatos avançados" está recolhida (`<details>` fechado)

#### Scenario: Base64 disponível após geração

- **WHEN** o usuário expande formatos avançados após gerar um QR
- **THEN** o sistema exibe data URL PNG completa (`data:image/png;base64,...`) somente leitura, com opção de copiar

#### Scenario: Bytes PNG disponíveis

- **WHEN** o usuário expande formatos avançados após gerar um QR
- **THEN** o sistema exibe representação dos bytes PNG (`Uint8Array`) com total de bytes e amostra truncada

#### Scenario: Bitmap RGBA disponível

- **WHEN** o usuário expande formatos avançados após gerar um QR
- **THEN** o sistema exibe metadados do bitmap (`ImageData`: width, height, amostra RGBA)

### Requirement: Log de erros

O sistema SHALL acumular erros de geração e ações em textarea read-only, com timestamp e origem.

#### Scenario: Erro de geração no log

- **WHEN** ocorre falha ao gerar QR Code
- **THEN** o log registra entrada com horário, origem `create` e mensagem legível

#### Scenario: Erro de ação no log

- **WHEN** falha download ou cópia (ex.: clipboard indisponível)
- **THEN** o log registra entrada com origem `action` e mensagem legível

### Requirement: Ausência de leitor de QR

O sistema SHALL NOT incluir funcionalidade de leitura, decode ou câmera para QR Code.

#### Scenario: Sem UI de leitura

- **WHEN** o usuário navega na aplicação
- **THEN** não existem controles de upload/câmera/decodificação de QR
