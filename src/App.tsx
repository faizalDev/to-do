import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Menu, LogOut } from 'lucide-react';
import { Task } from './types';
import TaskColumn from './components/TaskColumn';
import TaskModal from './components/TaskModal';
import LoginForm from './components/LoginForm';
import * as db from './db';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [authError, setAuthError] = useState<string>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingToStatus, setAddingToStatus] = useState<Task['status']>('todo');

  useEffect(() => {
    if (isAuthenticated) {
      db.getTasks().then(setTasks);
    }
  }, [isAuthenticated]);

  const handleLogin = async (username: string, password: string) => {
    const isValid = await db.verifyCredentials(username, password);
    if (isValid) {
      setIsAuthenticated(true);
      setAuthError(undefined);
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      setAuthError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      status: addingToStatus,
    };
    await db.addTask(newTask);
    setTasks(prevTasks => [...prevTasks, newTask]);
    setShowAddModal(false);
  };

  const handleDeleteTask = async (id: string) => {
    await db.deleteTask(id);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const handleMoveTask = async (taskId: string, newStatus: Task['status']) => {
    await db.updateTask(taskId, { status: newStatus });
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleEditTask = async (taskId: string, updatedTask: Partial<Task>) => {
    await db.updateTask(taskId, updatedTask);
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      )
    );
  };

  const openAddModal = (status: Task['status']) => {
    setAddingToStatus(status);
    setShowAddModal(true);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={authError} />;
  }

  const filteredTasks = {
    todo: tasks.filter(task => task.status === 'todo'),
    inProgress: tasks.filter(task => task.status === 'inProgress'),
    done: tasks.filter(task => task.status === 'done')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-600">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Team Board</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn
            title="To do"
            status="todo"
            tasks={filteredTasks.todo}
            onAddTask={() => openAddModal('todo')}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
            onEditTask={handleEditTask}
          />
          <TaskColumn
            title="In progress"
            status="inProgress"
            tasks={filteredTasks.inProgress}
            onAddTask={() => openAddModal('inProgress')}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
            onEditTask={handleEditTask}
          />
          <TaskColumn
            title="Done"
            status="done"
            tasks={filteredTasks.done}
            onAddTask={() => openAddModal('done')}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
            onEditTask={handleEditTask}
          />
        </div>
      </main>

      {showAddModal && (
        <TaskModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTask}
        />
      )}
    </div>
  );
}

export default App;