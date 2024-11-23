import Dexie, { type Table } from 'dexie';
import { Task } from '../types';

export interface Category {
  name: string;
  createdAt: Date;
}

export interface Auth {
  username: string;
  password: string;
}

class TeamBoardDB extends Dexie {
  tasks!: Table<Task>;
  categories!: Table<Category>;
  auth!: Table<Auth>;

  constructor() {
    super('TeamBoardDB');
    this.version(1).stores({
      tasks: 'id, status, createdAt',
      categories: 'name, createdAt',
      auth: 'username'
    });
  }
}

const db = new TeamBoardDB();

// Initialize default data
const initializeDefaults = async () => {
  const adminExists = await db.auth.get('admin');
  if (!adminExists) {
    await db.auth.add({
      username: 'admin',
      password: 'ctis@54321'
    });
  }

  const defaultCategories = [
    'BotWaba',
    'Digital Product',
    'WhatsAuto',
    'ChatFlow Crm',
    'Meta Ads',
    'Other'
  ];

  for (const categoryName of defaultCategories) {
    const exists = await db.categories.get(categoryName);
    if (!exists) {
      await db.categories.add({
        name: categoryName,
        createdAt: new Date()
      });
    }
  }
};

initializeDefaults().catch(console.error);

// Task operations
export const getTasks = async () => {
  return await db.tasks.orderBy('createdAt').reverse().toArray();
};

export const addTask = async (task: Task) => {
  await db.tasks.add({
    ...task,
    createdAt: new Date()
  });
};

export const updateTask = async (id: string, task: Partial<Task>) => {
  await db.tasks.update(id, task);
};

export const deleteTask = async (id: string) => {
  await db.tasks.delete(id);
};

// Category operations
export const getCategories = async () => {
  const categories = await db.categories.orderBy('createdAt').toArray();
  return categories.map(c => c.name);
};

export const addCategory = async (name: string) => {
  await db.categories.add({
    name,
    createdAt: new Date()
  });
};

export const deleteCategory = async (name: string) => {
  await db.categories.delete(name);
};

// Auth operations
export const verifyCredentials = async (username: string, password: string) => {
  const user = await db.auth.get(username);
  return user?.password === password;
};

export default db;