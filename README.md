# Dining Room Sonic Guide

Crie uma aplicação web em React (Vite), TypeScript e Tailwind CSS chamada "RestoAcoust Calc", focada em engenharia acústica para restaurantes. O aplicativo deve ser uma Single Page Application (SPA) moderna, limpa, responsiva, com visual profissional de software de engenharia (estética estilo SaaS, com cards organizados, cores sóbrias e ícones da biblioteca Lucide React). O app deve rodar 100% no navegador, sem backend, sem banco de dados e sem tela de login.



### 1. Estrutura de Entrada de Dados (Inputs em Abas ou Layout Dividido)

- **Dimensões do Salão:** Comprimento (m), Largura (m) e Pé-direito (m). O app deve calcular automaticamente o Volume (V, em m³) e as áreas superficiais (Piso, Paredes e Forro).

- **Ocupação e Perfil:**

  - Número de clientes sentados (N).

  - Tipo de ambiente / Nível de atividade (ex: Restaurante sofisticado/calmo, Restaurante familiar movimentado, Bar/Choperia animado).

- **Materiais de Acabamento (Seleção por Superfície: Piso, Paredes, Forro):**

  - Cada superfície deve permitir selecionar o material a partir de um banco de dados interno em JSON com coeficientes de absorção médios ($\alpha$) (ex: Concreto, Cerâmica, Piso Vinílico, Drywall, Vidro, Gesso Acartonado, Lã de Rocha com tecido, Madeira perfurada, etc.).

  - Permitir também inserir um coeficiente personalizado de forma manual se o usuário desejar.



### 2. Motor de Cálculo Científico (JavaScript Puro no Frontend)

O app deve calcular em tempo real a cada alteração:

- **Tempo de Reverberação (Fórmula de Sabine):** 

  $RT_{60} = 0.161 \times V / A$, onde $A$ é a área equivalente de absorção total (incluindo a absorção dos materiais de revestimento + a absorção padrão por pessoa sentada).

- **Capacidade Acústica (Modelo de Jan H. Rindel):**

  Implementar o modelo de Rindel para avaliação de ruído em restaurantes, que relaciona a potência acústica gerada pelas conversas (aumento do nível sonoro com o número de pessoas) e o Efeito Lombard (fenômeno onde as pessoas falam mais alto à medida que o ruído de fundo aumenta).

- **Nível de Ruído Previsto (L_p, em dBA):**

  Estimar o nível de ruído ambiente em função do número de ocupantes e do tempo de reverberação do salão, considerando o feedback do Efeito Lombard.

- **Classificação Acústica:**

  Classificar o desempenho do restaurante com base no RT60 calculado e no nível de ruído previsto (ex: Excelente, Bom, Regular, Insuficiente para conversação confortável).



### 3. Dashboard de Resultados e Recomendações

- **Cards de Indicadores Chave (KPIs):**

  - Tempo de Reverberação Atual ($RT_{60}$ em segundos).

  - Nível de Ruído Previsto com o Efeito Lombard (dBA).

  - Capacidade Acústica Máxima Recomendada (número de pessoas limite para manter o conforto conforme Rindel).

  - Status da Classe Acústica (com selo visual de cor: Verde, Amarelo ou Vermelho).

- **Simulador de Intervenção (O que acontece se...):**

  - Um bloco interativo onde o usuário pode simular: "E se eu adicionar X metros quadrados de painéis acústicos absorventes no forro (NRC 0.85)?". O app recalcula instantaneamente o novo $RT_{60}$ e o novo nível de ruído.

- **Sugestões Automáticas de Tratamento:**

  - Se o $RT_{60}$ estiver acima do ideal para restaurantes (geralmente recomendado entre 0.6s e 0.8s), exibir uma recomendação clara de quantos metros quadrados de material absorvente faltam ser instalados.

- **Exportação de Resumo:**

  - Um botão "Gerar Relatório Técnico Resumido" que abre uma janela modal formatada em texto limpo, permitindo que o engenheiro copie o memorial de cálculo resumido para a área de transferência ou imprima direto em PDF pelo navegador.



### 4. Fórmulas exatas (usar estas, do Rindel 2019, que usei no meu artigo)

- T da sala VAZIA vem dos materiais (Sabine): A_vazia = soma(área x alfa) e T = 0,161*V/A_vazia.

- Absorção das pessoas: Ap = 0,35 m² por pessoa sentada. A_total = A_vazia + N*0,35.

- Ruído de fundo com efeito Lombard: L_N = 93 - 20*log10(A_total*g/N), com g = 3,5 (tamanho médio dos grupos).

- Relação fala-ruído a 1 m: SNR = 10*log10(Q*A_total*g / (16*pi*r²*N)), com Q = 2 e r = 1 m. Mínimo de projeto: SNR = -3 dB. Nível de fala a 1 m = L_N + SNR.

- Capacidade acústica: N_max = V/(20*T), com o T da sala vazia.

- Classes de qualidade pelo índice T*N/V (em s/m³): A ≤ 0,025 ; B ≤ 0,040 ; C ≤ 0,063 ; D ≤ 0,100 ; acima = E (ruim). Classe C é o mínimo aceitável pra restaurante novo. Meta: T_C = 0,063*V/N. Mostrar quantos m² de material com alfa 0,90 faltam pra chegar nesse T.

- Em vez de "0,6 a 0,8 s ideal", usar esse T_C como meta.

- Campo opcional "T medido (s)": se preencher, usa esse T (sala vazia) no lugar do calculado pelos materiais.

- Botão "Exemplo do artigo": salão 20 x 15 m, pé direito 3 m, 100 pessoas, T medido 1,2 s. Tem que dar: A_vazia 120,8 m², A_total ≈ 155,8 m², ruído ≈ 78,3 dB, SNR ≈ -6,7 dB, capacidade ≈ 38 pessoas, meta classe C T = 0,57 s.

- Tudo em português do Brasil.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dining-room-sonic-guide.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0750b77d-ede0-43e9-a1d4-bd3fe1f94d25).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
