import { useState, useEffect } from "react";
import PrimaryButton from "./buttons/PrimaryButton";

interface Task {
  id: number;
  name: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  created_at?: string;
}

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ name: "", description: "", deadline: "" });
  const [loading, setLoading] = useState(true);
  const API_BASE = "http://localhost:8000";  // Adjust if needed

  // Fetch tasks on load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.name.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (response.ok) {
        setNewTask({ name: "", description: "", deadline: "" });
        fetchTasks();  // Refresh list
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTask = async (id: number, currentCompleted: boolean) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      fetchTasks();  // Refresh
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
      fetchTasks();  // Refresh
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex flex-col justify-center items-center w-full h-[98%] bg-[var(--color-primary)]">
      <h1 className="text-6xl">Task Manager</h1>

      {/* Add Task Form */}
      <div className="flex flex-col items-center my-4 p-4 w-[40%] rounded-2xl bg-[var(--background)]">
        <input
          type="text"
          placeholder="Task Name"
          value={newTask.name}
          onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Deadline (e.g., 8:00)"
          value={newTask.deadline}
          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
          className="mb-2 p-2 border rounded w-full"
        />
        <PrimaryButton text="Add Task" onClick={addTask} disabled={!newTask.name.trim()} />
      </div>

      {/* Tasks Display */}
      <div className="flex flex-col items-center my-10 p-8 w-[40%] h-[500px] rounded-4xl shadow-[2px_2px_1px_rgba(0,0,0,0.4)] bg-[var(--background)] overflow-y-auto">
        <h2 className="text-2xl mb-4">Current Tasks:</h2>
        {tasks.map((task) => (
          <div key={task.id} className="flex justify-center items-center gap-2 bg-[var(--background)] w-[80%] h-14 mb-2 p-2 rounded">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id, task.completed)}
              className="w-5 h-5"
            />
            <div className="flex flex-col flex-1">
              <p className="text-xl font-semibold">{task.name}</p>
              {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
              {task.deadline && <p className="text-sm text-gray-500">Deadline: {task.deadline}</p>}
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="cursor-pointer w-6 h-6 text-md font-bold rounded-full bg-[var(--error)]"
            >
              <img src="delete-icon.svg" alt="Delete" />  {/* Assume you have this icon */}
            </button>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-gray-500">No tasks yet. Add one above!</p>}
      </div>
    </div>
  );
};

export default App;