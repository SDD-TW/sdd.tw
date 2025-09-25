FROM node:20-alpine AS base

# 安裝必要工具和構建依賴
RUN apk add --no-cache libc6-compat python3 make g++ git

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 yarn.lock
COPY package.json ./
COPY yarn.lock* ./

# 啟用 Corepack 並設置 Yarn 版本
RUN corepack enable && corepack prepare yarn@4.5.2 --activate

# 創建 .yarnrc.yml 文件以啟用 node_modules 模式
RUN echo 'nodeLinker: node-modules' > .yarnrc.yml

# 安裝依賴
RUN yarn install

# 複製其餘源代碼
COPY . .

# 構建應用
RUN yarn build

# 生產環境
FROM node:20-alpine AS production

# 安裝必要的運行時依賴
RUN apk add --no-cache libc6-compat

# 設定工作目錄
WORKDIR /app

# 啟用 Corepack 並設置 Yarn 版本
RUN corepack enable && corepack prepare yarn@4.5.2 --activate

# 複製必要文件從構建階段
COPY --from=base /app/package.json ./
COPY --from=base /app/yarn.lock ./
COPY --from=base /app/.yarnrc.yml ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.ts ./
COPY --from=base /app/node_modules ./node_modules

# 設定環境變數 (使用默認值 3000)
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 啟動命令 (使用顯式端口而不是環境變數)
CMD ["yarn", "start", "--port", "3000"]