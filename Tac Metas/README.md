# Tac Metas – Painel de Metas Mobile

Frontend React + TypeScript + Vite com Tailwind (mobile-first) para registrar atividades, penalizações e horas extras de técnicos de telecom. Todos os dados ficam no **localStorage** com exportação/importação JSON e geração de PDF.

## Requisitos atendidos
- Período de apuração 26 → 25 com navegação de ciclos.
- Cap diário de 15 pontos positivos por dia.
- Ajuste de meta por horas extras: primeiras 20h desconsideradas; a cada 2h completas após isso soma +1 na meta mínima.
- Metas por cargo pré-configuradas.
- Pontos por tipo de serviço e complexidade (regras editáveis em `src/data/rules.ts`).
- Penalizações com motivos e pontos negativos predefinidos.
- Páginas: Setup, Dashboard, Nova Atividade (com modal de penalização), Horas Extras, Relatórios.
- Exportar/Importar JSON e gerar PDF (jsPDF + autotable).

## Rodar o projeto
```cmd
npm install
npm run dev
```
Abra o endereço indicado (geralmente http://localhost:5173).

## Estrutura de pastas (principal)
```
src/
  app/
    App.tsx
    router.tsx
    context.tsx
    storage.ts
    dates.ts
    calc.ts
    pdf.ts
  data/
    rules.ts
    meta.ts
  components/
    Header.tsx
    BottomNav.tsx
    Card.tsx
    Chips.tsx
    ProgressBar.tsx
    Modal.tsx
    Toast.tsx
  pages/
    Setup.tsx
    Dashboard.tsx
    NewActivity.tsx
    Reports.tsx
    Overtime.tsx
  styles/
    index.css
```

## Uso rápido
1) Abra o app: preencha **Nome** e **Cargo** na tela de Setup.
2) Dashboard mostra período corrente (26→25), pontos positivos/penalizações, meta ajustada e status.
3) **Nova Atividade**: registre OS, tipo, complexidade, metros de cabo (calcula pontos). Abra o modal para adicionar penalizações.
4) **Horas Extras**: registre início/fim do extra. Validação impede finalizar sem início no mesmo dia. Duração contabilizada para ajuste de meta.
5) **Relatórios**: filtros (hoje, última semana, mês atual), listas de atividades e horas, exportar/importar JSON, gerar PDF do período.

## Ajustes e edição de regras
- Pontos por serviço/complexidade e cálculo de lançamento de cabo: `src/data/rules.ts`.
- Metas base por cargo: `src/data/meta.ts`.
- Lógica de períodos e cálculo (cap diário, meta ajustada): `src/app/calc.ts` e `src/app/dates.ts`.

## Notas de design
- Layout mobile-first (Android/iOS), cards arredondados, cores suaves estilo “MK Agentes”.
- Navegação inferior fixa com blur/sombra e área segura.
- Tipografia Inter via Google Fonts.

## Backup e PDF
- **Exportar JSON** e **Importar JSON** em Relatórios (usa download/upload local).
- **Gerar PDF** no Dashboard e Relatórios com resumo, últimas atividades e horas extras.

## Scripts
- `npm run dev` – ambiente de desenvolvimento.
- `npm run build` – build de produção.
- `npm run lint` – lint.

## Observações
- Dados ficam apenas no navegador (sem backend).
- Tailwind 3 está configurado em `tailwind.config.js` + `postcss.config.js`.
