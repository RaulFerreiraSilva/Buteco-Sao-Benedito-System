import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema interfaces
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  available: boolean;
  createdAt: Date;
}

export interface Table {
  id: string;
  number: number;
  name: string;
  isOccupied: boolean;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid';
  createdAt: Date;
  updatedAt: Date;
  paymentMethod?: 'cash' | 'card' | 'pix';
}

export interface DailySummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  ordersCount: number;
  topItems: Array<{ item: string; quantity: number; revenue: number }>;
}

// Database schema
interface RestaurantDB extends DBSchema {
  menuItems: {
    key: string;
    value: MenuItem;
    indexes: { 'by-category': string };
  };
  tables: {
    key: string;
    value: Table;
    indexes: { 'by-number': number };
  };
  orders: {
    key: string;
    value: Order;
    indexes: { 'by-table': string; 'by-date': Date; 'by-status': string };
  };
}

class DatabaseManager {
  private db: IDBPDatabase<RestaurantDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<RestaurantDB>('RestaurantDB', 1, {
      upgrade(db) {
        // Menu Items store
        const menuStore = db.createObjectStore('menuItems', { keyPath: 'id' });
        menuStore.createIndex('by-category', 'category');

        // Tables store
        const tablesStore = db.createObjectStore('tables', { keyPath: 'id' });
        tablesStore.createIndex('by-number', 'number');

        // Orders store
        const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
        ordersStore.createIndex('by-table', 'tableId');
        ordersStore.createIndex('by-date', 'createdAt');
        ordersStore.createIndex('by-status', 'status');
      },
    });
  }

  private ensureDb(): IDBPDatabase<RestaurantDB> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // Menu Items
  async addMenuItem(item: Omit<MenuItem, 'id' | 'createdAt'>): Promise<MenuItem> {
    const db = this.ensureDb();
    const menuItem: MenuItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    await db.add('menuItems', menuItem);
    return menuItem;
  }

  async getMenuItems(): Promise<MenuItem[]> {
    const db = this.ensureDb();
    return db.getAll('menuItems');
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
    const db = this.ensureDb();
    const item = await db.get('menuItems', id);
    if (item) {
      await db.put('menuItems', { ...item, ...updates });
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    const db = this.ensureDb();
    await db.delete('menuItems', id);
  }

  // Tables
  async addTable(table: Omit<Table, 'id' | 'createdAt'>): Promise<Table> {
    const db = this.ensureDb();
    const newTable: Table = {
      ...table,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    await db.add('tables', newTable);
    return newTable;
  }

  async getTables(): Promise<Table[]> {
    const db = this.ensureDb();
    return db.getAll('tables');
  }

  async updateTable(id: string, updates: Partial<Table>): Promise<void> {
    const db = this.ensureDb();
    const table = await db.get('tables', id);
    if (table) {
      await db.put('tables', { ...table, ...updates });
    }
  }

  async deleteTable(id: string): Promise<void> {
    const db = this.ensureDb();
    await db.delete('tables', id);
  }

  // Orders
  async addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const db = this.ensureDb();
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.add('orders', newOrder);
    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    const db = this.ensureDb();
    return db.getAll('orders');
  }

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    const db = this.ensureDb();
    return db.getAllFromIndex('orders', 'by-table', tableId);
  }

  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    const db = this.ensureDb();
    return db.getAllFromIndex('orders', 'by-status', status);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    const db = this.ensureDb();
    const order = await db.get('orders', id);
    if (order) {
      await db.put('orders', { ...order, ...updates, updatedAt: new Date() });
    }
  }

  async deleteOrder(id: string): Promise<void> {
    const db = this.ensureDb();
    await db.delete('orders', id);
  }

  // Daily Summary
  async getDailySummary(date: string): Promise<DailySummary> {
    const db = this.ensureDb();
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const tx = db.transaction(['orders', 'menuItems'], 'readonly');
    const orders = await tx.objectStore('orders').getAll();
    const menuItems = await tx.objectStore('menuItems').getAll();

    const dayOrders = orders.filter(
      order => order.createdAt >= startDate && order.createdAt < endDate && order.status === 'paid'
    );

    const totalRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
    const itemCounts = new Map<string, { quantity: number; revenue: number }>();

    dayOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        if (menuItem) {
          const current = itemCounts.get(menuItem.name) || { quantity: 0, revenue: 0 };
          itemCounts.set(menuItem.name, {
            quantity: current.quantity + item.quantity,
            revenue: current.revenue + (item.price * item.quantity),
          });
        }
      });
    });

    const topItems = Array.from(itemCounts.entries())
      .map(([item, data]) => ({ item, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      date,
      totalOrders: dayOrders.length,
      totalRevenue,
      ordersCount: dayOrders.length,
      topItems,
    };
  }
}

// Singleton instance
export const db = new DatabaseManager();