import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db as firestore } from '@/utils/firebase';
import { getCurrentDateString } from '@/lib/utils';

// User and Authentication interfaces
export type UserRole = 'admin' | 'caixa' | 'garcom' | 'cozinha';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  password: string; // Senha criptografada
  isActive: boolean;
  createdAt: Date;
}

// Menu Item interface
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
  openTables: number;
  tablesCreatedToday: number;
  topItems: Array<{ item: string; quantity: number; revenue: number }>;
}

export interface DayOpen {
  id: string;
  date: string;
  tablesOpened: number;
  totalOrders: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

class DatabaseManager {
  private usersCollection = 'users';
  private menuItemsCollection = 'menuItems';
  private tablesCollection = 'tables';
  private daysOpenCollection = 'daysOpen';
  private ordersCollection = 'orders';

  async init(): Promise<void> {
    // Firebase é inicializado automaticamente, não precisa de setup adicional
    console.log('Firebase database ready');
  }

  // Funções de criptografia de senha
  private async hashPassword(password: string): Promise<string> {
    // Usar Web Crypto API para hash da senha
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'buteco-salt-2025'); // Adicionar salt
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hashedPassword;
  }

  // Helper function to convert Firestore timestamp to Date
  private timestampToDate(timestamp: any): Date {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  }

  // USER METHODS
  async addUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      // Criptografar senha antes de salvar
      const hashedPassword = await this.hashPassword(userData.password);
      
      const userRef = await addDoc(collection(firestore, this.usersCollection), {
        name: userData.name,
        role: userData.role,
        password: hashedPassword,
        isActive: userData.isActive,
        createdAt: serverTimestamp(),
      });

      const newUser: User = {
        id: userRef.id,
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
      };

      return newUser;
    } catch (error) {
      console.error('Error adding user:', error);
      throw new Error('Erro ao criar usuário');
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const docRef = doc(firestore, this.usersCollection, userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        role: data.role,
        password: data.password,
        isActive: data.isActive,
        createdAt: this.timestampToDate(data.createdAt),
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(firestore, this.usersCollection));
      const users: User[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          name: data.name,
          role: data.role,
          password: data.password,
          isActive: data.isActive,
          createdAt: this.timestampToDate(data.createdAt),
        });
      });

      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Erro ao buscar usuários');
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(firestore, this.usersCollection, userId);
      const updateData: any = { ...updates };
      
      // Criptografar senha se estiver sendo atualizada
      if (updateData.password) {
        updateData.password = await this.hashPassword(updateData.password);
      }
      
      // Remover campos que não devem ser atualizados
      delete updateData.id;
      delete updateData.createdAt;

      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Erro ao atualizar usuário');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, this.usersCollection, userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Erro ao excluir usuário');
    }
  }

  // Autenticação
  async authenticateUser(name: string, password: string): Promise<User | null> {
    try {
      const q = query(
        collection(firestore, this.usersCollection),
        where('name', '==', name),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // Verificar senha
      const isValidPassword = await this.verifyPassword(password, userData.password);
      
      if (!isValidPassword) {
        return null;
      }

      return {
        id: userDoc.id,
        name: userData.name,
        role: userData.role,
        password: userData.password,
        isActive: userData.isActive,
        createdAt: this.timestampToDate(userData.createdAt),
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw new Error('Erro na autenticação');
    }
  }

  // Admin methods
  async createUserByAdmin(userData: Omit<User, 'id' | 'createdAt'>, adminUserId: string): Promise<User> {
    // Verificar se o usuário que está criando é admin
    const adminUser = await this.getUser(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Apenas administradores podem criar usuários');
    }

    return await this.addUser(userData);
  }

  async updateUserByAdmin(userId: string, updates: Partial<Pick<User, 'name' | 'role' | 'password' | 'isActive'>>, adminUserId: string): Promise<void> {
    // Verificar se o usuário que está atualizando é admin
    const adminUser = await this.getUser(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Apenas administradores podem atualizar usuários');
    }

    // Não permitir que o admin desative a si mesmo
    if (userId === adminUserId && updates.isActive === false) {
      throw new Error('Você não pode desativar sua própria conta');
    }

    await this.updateUser(userId, updates);
  }

  async deleteUserByAdmin(userId: string, adminUserId: string): Promise<void> {
    // Verificar se o usuário que está excluindo é admin
    const adminUser = await this.getUser(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Apenas administradores podem excluir usuários');
    }

    // Não permitir que o admin exclua a si mesmo
    if (userId === adminUserId) {
      throw new Error('Você não pode excluir sua própria conta');
    }

    await this.deleteUser(userId);
  }

  // MENU ITEMS METHODS
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const querySnapshot = await getDocs(collection(firestore, this.menuItemsCollection));
      const menuItems: MenuItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        menuItems.push({
          id: doc.id,
          name: data.name,
          price: data.price,
          category: data.category,
          description: data.description,
          available: data.available,
          createdAt: this.timestampToDate(data.createdAt),
        });
      });

      return menuItems;
    } catch (error) {
      console.error('Error getting menu items:', error);
      throw new Error('Erro ao buscar itens do menu');
    }
  }

  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    try {
      const docRef = doc(firestore, this.menuItemsCollection, itemId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        price: data.price,
        category: data.category,
        description: data.description,
        available: data.available,
        createdAt: this.timestampToDate(data.createdAt),
      };
    } catch (error) {
      console.error('Error getting menu item:', error);
      throw new Error('Erro ao buscar item do menu');
    }
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    try {
      const q = query(
        collection(firestore, this.menuItemsCollection),
        where('category', '==', category),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const menuItems: MenuItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        menuItems.push({
          id: doc.id,
          name: data.name,
          price: data.price,
          category: data.category,
          description: data.description,
          available: data.available,
          createdAt: this.timestampToDate(data.createdAt),
        });
      });

      return menuItems;
    } catch (error) {
      console.error('Error getting menu items by category:', error);
      throw new Error('Erro ao buscar itens da categoria');
    }
  }

  async getAvailableMenuItems(): Promise<MenuItem[]> {
    try {
      const q = query(
        collection(firestore, this.menuItemsCollection),
        where('available', '==', true),
        orderBy('category'),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const menuItems: MenuItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        menuItems.push({
          id: doc.id,
          name: data.name,
          price: data.price,
          category: data.category,
          description: data.description,
          available: data.available,
          createdAt: this.timestampToDate(data.createdAt),
        });
      });

      return menuItems;
    } catch (error) {
      console.error('Error getting available menu items:', error);
      throw new Error('Erro ao buscar itens disponíveis');
    }
  }

  async addMenuItem(item: Omit<MenuItem, 'id' | 'createdAt'>): Promise<MenuItem> {
    try {
      const menuItemRef = await addDoc(collection(firestore, this.menuItemsCollection), {
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description || '',
        available: item.available,
        createdAt: serverTimestamp(),
      });

      const newMenuItem: MenuItem = {
        id: menuItemRef.id,
        ...item,
        createdAt: new Date(),
      };

      return newMenuItem;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw new Error('Erro ao adicionar item do menu');
    }
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
    try {
      const menuItemRef = doc(firestore, this.menuItemsCollection, id);
      const updateData: any = { ...updates };
      
      // Remover campos que não devem ser atualizados
      delete updateData.id;
      delete updateData.createdAt;

      await updateDoc(menuItemRef, updateData);
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw new Error('Erro ao atualizar item do menu');
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, this.menuItemsCollection, id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw new Error('Erro ao excluir item do menu');
    }
  }

  async toggleMenuItemAvailability(id: string): Promise<void> {
    try {
      const menuItem = await this.getMenuItem(id);
      if (!menuItem) {
        throw new Error('Item do menu não encontrado');
      }

      await this.updateMenuItem(id, { available: !menuItem.available });
    } catch (error) {
      console.error('Error toggling menu item availability:', error);
      throw new Error('Erro ao alterar disponibilidade do item');
    }
  }

  // Admin methods para menu items
  async addMenuItemByAdmin(item: Omit<MenuItem, 'id' | 'createdAt'>, adminUserId: string): Promise<MenuItem> {
    // Verificar se o usuário que está criando é admin
    const adminUser = await this.getUser(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Apenas administradores podem adicionar itens ao menu');
    }

    return await this.addMenuItem(item);
  }

  async updateMenuItemByAdmin(itemId: string, updates: Partial<MenuItem>, adminUserId: string): Promise<void> {
    // Verificar se o usuário que está atualizando é admin
    const adminUser = await this.getUser(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Apenas administradores podem atualizar itens do menu');
    }

    await this.updateMenuItem(itemId, updates);
  }

  async deleteMenuItemByAdmin(itemId: string, adminUserId: string): Promise<void> {
    // Verificar se o usuário que está excluindo é admin
    const adminUser = await this.getUser(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Apenas administradores podem excluir itens do menu');
    }

    await this.deleteMenuItem(itemId);
  }

  async toggleMenuItemAvailabilityByAdmin(itemId: string, adminUserId: string): Promise<void> {
    // Verificar se o usuário que está alterando é admin
    const adminUser = await this.getUser(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Apenas administradores podem alterar disponibilidade de itens');
    }

    await this.toggleMenuItemAvailability(itemId);
  }

  // MESA METHODS
  async addTable(tableName: string): Promise<string> {
    try {
      const tableRef = await addDoc(collection(firestore, this.tablesCollection), {
        name: tableName,
        status: 'open', // open, closed
        createdAt: serverTimestamp(),
      });
      
      // Incrementar mesas abertas no dia
      const today = getCurrentDateString();
      await this.incrementTablesOpened(today);
      
      return tableRef.id;
    } catch (error) {
      console.error('Error adding table:', error);
      throw new Error('Erro ao criar mesa');
    }
  }

  async getTables(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(firestore, this.tablesCollection));
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: this.timestampToDate(doc.data().createdAt)
      }));
    } catch (error) {
      console.error('Error getting tables:', error);
      throw new Error('Erro ao buscar mesas');
    }
  }

  async getTable(tableId: string): Promise<any> {
    try {
      const docRef = doc(firestore, this.tablesCollection, tableId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Mesa não encontrada');
      
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: this.timestampToDate(data.createdAt)
      };
    } catch (error) {
      console.error('Error getting table:', error);
      throw new Error('Erro ao buscar mesa');
    }
  }

  async closeTable(tableId: string): Promise<void> {
    try {
      await updateDoc(doc(firestore, this.tablesCollection, tableId), { status: 'closed' });
    } catch (error) {
      console.error('Error closing table:', error);
      throw new Error('Erro ao fechar mesa');
    }
  }

  async deleteTable(tableId: string): Promise<void> {
    try {
      // Primeiro, excluir todos os pedidos da mesa
      const ordersRef = collection(firestore, this.tablesCollection, tableId, 'orders');
      const ordersSnapshot = await getDocs(ordersRef);
      
      // Excluir cada pedido individualmente
      const deletePromises = ordersSnapshot.docs.map(orderDoc => 
        deleteDoc(orderDoc.ref)
      );
      
      // Aguardar todas as exclusões dos pedidos
      await Promise.all(deletePromises);
      
      // Depois excluir a mesa
      await deleteDoc(doc(firestore, this.tablesCollection, tableId));
    } catch (error) {
      console.error('Error deleting table:', error);
      throw new Error('Erro ao excluir mesa');
    }
  }

  // PEDIDOS POR MESA
  async addOrderToTable(tableId: string, order: any): Promise<string> {
    try {
      const ordersRef = collection(firestore, this.tablesCollection, tableId, 'orders');
      const orderRef = await addDoc(ordersRef, {
        ...order,
        status: 'pending', // pending, delivered
        createdAt: serverTimestamp(),
      });
      
      // Atualizar totais da mesa
      await this.updateTableTotals(tableId);
      
      // Incrementar estatísticas do dia
      const today = getCurrentDateString();
      const orderValue = (order.price || 0) * (order.quantity || 1);
      await this.incrementOrderStats(today, orderValue);
      
      return orderRef.id;
    } catch (error) {
      console.error('Error adding order to table:', error);
      throw new Error('Erro ao adicionar pedido à mesa');
    }
  }

  // Atualizar totais de uma mesa específica
  async updateTableTotals(tableId: string): Promise<void> {
    try {
      const orders = await this.getOrdersForTable(tableId);
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Atualizar documento da mesa com os totais
      const tableRef = doc(firestore, this.tablesCollection, tableId);
      await updateDoc(tableRef, {
        totalOrders,
        totalRevenue,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating table totals:', error);
      // Não falha a operação principal se não conseguir atualizar totais
    }
  }

  // Recalcular totais de todas as mesas (para corrigir dados históricos)
  async recalculateAllTableTotals(): Promise<void> {
    try {
      const tablesSnapshot = await getDocs(collection(firestore, this.tablesCollection));
      
      for (const tableDoc of tablesSnapshot.docs) {
        await this.updateTableTotals(tableDoc.id);
      }
      
      console.log('Totais de todas as mesas recalculados com sucesso');
    } catch (error) {
      console.error('Error recalculating all table totals:', error);
      throw new Error('Erro ao recalcular totais das mesas');
    }
  }

  async getOrdersForTable(tableId: string): Promise<any[]> {
    try {
      const ordersRef = collection(firestore, this.tablesCollection, tableId, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: this.timestampToDate(doc.data().createdAt)
      }));
    } catch (error) {
      console.error('Error getting orders for table:', error);
      throw new Error('Erro ao buscar pedidos da mesa');
    }
  }

  async updateOrderStatus(tableId: string, orderId: string, status: string): Promise<void> {
    try {
      const orderRef = doc(firestore, this.tablesCollection, tableId, 'orders', orderId);
      await updateDoc(orderRef, { status });
      
      // Atualizar totais da mesa após mudança de status
      await this.updateTableTotals(tableId);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Erro ao atualizar status do pedido');
    }
  }

  async getTableTotal(tableId: string): Promise<number> {
    try {
      const orders = await this.getOrdersForTable(tableId);
      return orders.reduce((total, order) => total + (order.price || 0), 0);
    } catch (error) {
      console.error('Error getting table total:', error);
      throw new Error('Erro ao calcular total da mesa');
    }
  }

  // ORDERS (implementação básica)
  async getOrders(): Promise<Order[]> {
    try {
      // Por enquanto retorna lista vazia
      // TODO: Implementar com Firebase
      return [];
    } catch (error) {
      console.error('Error getting orders:', error);
      throw new Error('Erro ao buscar pedidos');
    }
  }

  async addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // TODO: Implementar com Firebase
      throw new Error('Método não implementado ainda');
    } catch (error) {
      console.error('Error adding order:', error);
      throw new Error('Erro ao adicionar pedido');
    }
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    try {
      // TODO: Implementar com Firebase
      throw new Error('Método não implementado ainda');
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Erro ao atualizar pedido');
    }
  }

  async updateTable(tableId: string, updates: Partial<Table>): Promise<void> {
    try {
      // TODO: Implementar com Firebase
      throw new Error('Método não implementado ainda');
    } catch (error) {
      console.error('Error updating table:', error);
      throw new Error('Erro ao atualizar mesa');
    }
  }

  // DAYS OPEN MANAGEMENT
  async getDayOpen(date: string): Promise<DayOpen | null> {
    try {
      const q = query(
        collection(firestore, this.daysOpenCollection),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: this.timestampToDate(doc.data().createdAt),
        updatedAt: this.timestampToDate(doc.data().updatedAt)
      } as DayOpen;
    } catch (error) {
      console.error('Error getting day open:', error);
      throw new Error('Erro ao buscar dia aberto');
    }
  }

  async createOrUpdateDayOpen(date: string): Promise<DayOpen> {
    try {
      const existingDay = await this.getDayOpen(date);
      
      if (existingDay) {
        return existingDay;
      }
      
      const newDayOpen: Omit<DayOpen, 'id'> = {
        date,
        tablesOpened: 0,
        totalOrders: 0,
        totalRevenue: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(firestore, this.daysOpenCollection), {
        ...newDayOpen,
        createdAt: Timestamp.fromDate(newDayOpen.createdAt),
        updatedAt: Timestamp.fromDate(newDayOpen.updatedAt)
      });
      
      return {
        id: docRef.id,
        ...newDayOpen
      };
    } catch (error) {
      console.error('Error creating/updating day open:', error);
      throw new Error('Erro ao criar/atualizar dia aberto');
    }
  }

  async incrementTablesOpened(date: string): Promise<void> {
    try {
      const dayOpen = await this.createOrUpdateDayOpen(date);
      
      const dayRef = doc(firestore, this.daysOpenCollection, dayOpen.id);
      await updateDoc(dayRef, {
        tablesOpened: dayOpen.tablesOpened + 1,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error incrementing tables opened:', error);
      throw new Error('Erro ao incrementar mesas abertas');
    }
  }

  async incrementOrderStats(date: string, orderValue: number): Promise<void> {
    try {
      const dayOpen = await this.createOrUpdateDayOpen(date);
      
      const dayRef = doc(firestore, this.daysOpenCollection, dayOpen.id);
      await updateDoc(dayRef, {
        totalOrders: dayOpen.totalOrders + 1,
        totalRevenue: dayOpen.totalRevenue + orderValue,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error incrementing order stats:', error);
      throw new Error('Erro ao incrementar estatísticas de pedidos');
    }
  }

  async getRealTimeStats(date: string): Promise<{ tablesCreated: number; totalOrders: number; totalRevenue: number; openTables: number }> {
    try {
      // Buscar dados do daysOpen
      const dayOpen = await this.getDayOpen(date);
      
      // Buscar mesas abertas atualmente
      const tablesSnapshot = await getDocs(collection(firestore, this.tablesCollection));
      const openTables = tablesSnapshot.docs.length;
      
      return {
        tablesCreated: dayOpen?.tablesOpened || 0,
        totalOrders: dayOpen?.totalOrders || 0,
        totalRevenue: dayOpen?.totalRevenue || 0,
        openTables
      };
    } catch (error) {
      console.error('Error getting real-time stats:', error);
      return {
        tablesCreated: 0,
        totalOrders: 0,
        totalRevenue: 0,
        openTables: 0
      };
    }
  }

  // RELATÓRIOS
  async getDailySummary(date: string): Promise<DailySummary> {
    try {
      // Buscar dados do daysOpen primeiro
      const dayOpen = await this.getDayOpen(date);
      
      // Buscar todas as mesas abertas atualmente
      const tablesSnapshot = await getDocs(collection(firestore, this.tablesCollection));
      const openTables = tablesSnapshot.docs.length;
      
      // Se não existir daysOpen para o dia, criar com dados básicos
      let tablesCreatedToday = 0;
      let totalOrdersFromDay = 0;
      let totalRevenueFromDay = 0;
      
      if (dayOpen) {
        tablesCreatedToday = dayOpen.tablesOpened;
        totalOrdersFromDay = dayOpen.totalOrders;
        totalRevenueFromDay = dayOpen.totalRevenue;
      }
      
      // Buscar todos os pedidos de todas as mesas para o ranking de itens
      const startOfDay = new Date(date + 'T00:00:00');
      const endOfDay = new Date(date + 'T23:59:59.999');
      let allOrders: any[] = [];
      
      for (const tableDoc of tablesSnapshot.docs) {
        try {
          const ordersRef = collection(firestore, this.tablesCollection, tableDoc.id, 'orders');
          const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
          const ordersSnapshot = await getDocs(ordersQuery);
          
          const tableOrders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            tableId: tableDoc.id,
            ...doc.data(),
            createdAt: this.timestampToDate(doc.data().createdAt)
          })) as (OrderItem & { tableId: string; createdAt: Date })[];
          
          // Filtrar pedidos do dia
          const todayOrders = tableOrders.filter(order => {
            if (!order.createdAt) return false;
            const orderDate = new Date(order.createdAt);
            return orderDate >= startOfDay && orderDate <= endOfDay;
          });
          
          allOrders = [...allOrders, ...todayOrders];
          
        } catch (error) {
          console.log(`Erro ao buscar pedidos da mesa ${tableDoc.id}:`, error);
          // Continua para a próxima mesa
        }
      }
      
      // Agrupar itens para ranking
      const itemsMap = new Map<string, { quantity: number; revenue: number }>();
      
      allOrders.forEach(order => {
        const itemName = order.item || 'Item sem nome';
        const quantity = order.quantity || 1;
        const revenue = (order.price || 0) * quantity;
        
        if (itemsMap.has(itemName)) {
          const existing = itemsMap.get(itemName)!;
          itemsMap.set(itemName, {
            quantity: existing.quantity + quantity,
            revenue: existing.revenue + revenue
          });
        } else {
          itemsMap.set(itemName, { quantity, revenue });
        }
      });
      
      // Converter para array e ordenar por receita
      const topItems = Array.from(itemsMap.entries())
        .map(([item, data]) => ({ item, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10); // Top 10 itens
      
      return {
        date,
        totalOrders: totalOrdersFromDay,
        totalRevenue: totalRevenueFromDay,
        ordersCount: totalOrdersFromDay,
        openTables,
        tablesCreatedToday,
        topItems
      };
    } catch (error) {
      console.error('Error getting daily summary:', error);
      throw new Error('Erro ao gerar relatório diário');
    }
  }

  // Helper para criar o primeiro administrador (usar apenas na primeira configuração)
  async createFirstAdmin(adminData: { name: string; password: string }): Promise<User> {
    const users = await this.getUsers();
    if (users.length > 0) {
      throw new Error('Sistema já possui usuários cadastrados');
    }

    return await this.addUser({
      ...adminData,
      role: 'admin',
      isActive: true,
    });
  }

  // Verificar se o sistema tem usuários
  async hasUsers(): Promise<boolean> {
    try {
      const users = await this.getUsers();
      return users.length > 0;
    } catch (error) {
      console.error('Error checking if has users:', error);
      return false;
    }
  }
}

// Exportar instância singleton
const db = new DatabaseManager();
export default db;