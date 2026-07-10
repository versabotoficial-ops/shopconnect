import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createServer as createHttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs/promises';

const DB_FILE = path.join(process.cwd(), 'db.json');

// ---- Tipos internos do servidor ----
interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  replyToMessageId?: string;
  audioUrl?: string;
}

interface ChatRoom {
  id: string;
  participants: { id: string; name: string; avatar: string }[];
  messages: ChatMessage[];
  productId?: string;
  productTitle?: string;
  lastUpdated: string;
}

// ---- Estado em memória ----
let chatRooms = new Map<string, ChatRoom>();
const wsClients = new Map<WebSocket, { userId: string; chatId?: string }>();

function broadcast(chatId: string, data: object, excludeWs?: WebSocket) {
  const payload = JSON.stringify(data);
  wsClients.forEach((info, client) => {
    if (info.chatId === chatId && client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // ---- Estado em memória para Produtos ----
  let globalProducts = new Map<string, any>();

  // ---- Funções de Persistência ----
  async function loadDb() {
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      const json = JSON.parse(data);
      if (json.products) {
        globalProducts = new Map(json.products);
      }
      if (json.chats) {
        chatRooms = new Map(json.chats);
      }
    } catch (e) {
      console.log('Nenhum banco de dados local encontrado ou erro ao ler. Iniciando limpo.');
    }
  }

  async function saveDb() {
    try {
      const data = {
        products: Array.from(globalProducts.entries()),
        chats: Array.from(chatRooms.entries())
      };
      await fs.writeFile(DB_FILE, JSON.stringify(data), 'utf-8');
    } catch (e) {
      console.error('Erro ao salvar no db.json', e);
    }
  }

  await loadDb();

  // ---- REST API de Salas de Chat ----

  // Listar salas do usuário
  app.get('/api/chats', (req, res) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId obrigatório' });

    const userRooms = Array.from(chatRooms.values())
      .filter(r => r.participants.some(p => p.id === userId))
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

    res.json(userRooms);
  });

  // Criar ou buscar sala de chat entre dois usuários
  app.post('/api/chats', (req, res) => {
    const { userId, targetUserId, targetUserName, targetUserAvatar,
            currentUserName, currentUserAvatar, productId, productTitle } = req.body;

    if (!userId || !targetUserId) return res.status(400).json({ error: 'Dados incompletos' });

    // Verifica se já existe uma sala entre esses dois usuários para esse produto
    const existing = Array.from(chatRooms.values()).find(r => {
      const ids = r.participants.map(p => p.id);
      return ids.includes(userId) && ids.includes(targetUserId) &&
             (!productId || r.productId === productId);
    });

    if (existing) return res.json(existing);

    const newRoom: ChatRoom = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      participants: [
        { id: userId, name: currentUserName || 'Você', avatar: currentUserAvatar || '' },
        { id: targetUserId, name: targetUserName || 'Usuário', avatar: targetUserAvatar || '' },
      ],
      messages: [],
      productId,
      productTitle,
      lastUpdated: new Date().toISOString(),
    };

    chatRooms.set(newRoom.id, newRoom);
    saveDb();
    res.json(newRoom);
  });

  // Buscar mensagens de uma sala
  app.get('/api/chats/:chatId/messages', (req, res) => {
    const room = chatRooms.get(req.params.chatId);
    if (!room) return res.status(404).json({ error: 'Sala não encontrada' });
    res.json(room.messages);
  });

  // Outros endpoints existentes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ShopConnect API', chats: chatRooms.size, products: globalProducts.size });
  });

  // ---- REST API de Produtos ----
  
  // Listar todos os produtos
  app.get('/api/products', (_req, res) => {
    res.json(Array.from(globalProducts.values()));
  });

  // Criar um produto
  app.post('/api/products', (req, res) => {
    const product = req.body;
    if (!product || !product.id) return res.status(400).json({ error: 'Produto inválido' });
    globalProducts.set(product.id, product);
    saveDb();
    res.json(product);
  });

  // Atualizar um produto
  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const product = req.body;
    if (!globalProducts.has(id)) return res.status(404).json({ error: 'Produto não encontrado' });
    globalProducts.set(id, product);
    saveDb();
    res.json(product);
  });

  // Deletar um produto
  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    globalProducts.delete(id);
    saveDb();
    res.json({ success: true });
  });

  app.post('/api/payments/checkout', (_req, res) => {
    res.json({ success: true, transactionId: 'txn_' + Date.now() });
  });

  app.get('/api/shipping/:trackingId', (req, res) => {
    res.json({
      trackingId: req.params.trackingId,
      status: 'in_transit',
      location: 'Centro de Distribuição, SP',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  // ---- Vite Dev Middleware ----
  const httpServer = createHttpServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ---- WebSocket Server ----
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/chat' });

  wss.on('connection', (ws) => {
    wsClients.set(ws, { userId: '' });
    console.log(`[WS] Cliente conectado. Total: ${wsClients.size}`);

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        // Identificar usuário
        if (data.type === 'join') {
          wsClients.set(ws, { userId: data.userId, chatId: data.chatId });

          // Envia histórico de mensagens ao entrar na sala
          const room = chatRooms.get(data.chatId);
          if (room) {
            ws.send(JSON.stringify({ type: 'history', messages: room.messages, room }));
          }
          return;
        }

        // Enviar mensagem
        if (data.type === 'message') {
          const { chatId, message } = data as { chatId: string; message: ChatMessage };
          const room = chatRooms.get(chatId);
          if (!room) return;

          const newMsg: ChatMessage = {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toISOString(),
          };

          room.messages.push(newMsg);
          room.lastUpdated = newMsg.timestamp;
          saveDb();

          // Broadcast para todos na sala, incluindo o remetente
          const payload = JSON.stringify({ type: 'message', chatId, message: newMsg });
          wsClients.forEach((info, client) => {
            if (info.chatId === chatId && client.readyState === WebSocket.OPEN) {
              client.send(payload);
            }
          });
          return;
        }

        // Indicador de digitação
        if (data.type === 'typing') {
          broadcast(data.chatId, { type: 'typing', userId: data.userId, isTyping: data.isTyping }, ws);
          return;
        }

      } catch (e) {
        console.error('[WS] Erro ao processar mensagem:', e);
      }
    });

    ws.on('close', () => {
      wsClients.delete(ws);
      console.log(`[WS] Cliente desconectado. Total: ${wsClients.size}`);
    });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ ShopConnect rodando em http://0.0.0.0:${PORT}`);
    console.log(`🔌 WebSocket disponível em ws://localhost:${PORT}/ws/chat`);
  });
}

startServer();
