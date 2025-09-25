import { useState } from "react";
import PrimaryButton from "./buttons/PrimaryButton";

interface Task {
  name: string;
  deadline?: string;
  completed: boolean;
};

const App = () => {
  
    const [tasks, setTasks] = useState<Task[]>([
      { name: "Wash the dishes", description: "Wash all the dishes before auntie arrives", deadline: "8:00"}
    ]);

    const toggleTask = (index: number) => {
        setTasks((prevTasks) => prevTasks.map((task, i) =>
          i === index ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (index: number) => {
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.filter((_, i) => i !== index);
        console.log(`Task '${prevTasks[index]?.name}' deleted!`);
        return updatedTasks;
      });
    };

    return (
        <div className="flex flex-col justify-center items-center w-full h-[98%] bg-[var(--color-primary)]">
          <h1 className="text-6xl">Task Manager</h1>

          {/* Tasks Display */}
          <div className="flex flex-col items-center my-10 p-8 w-[40%] h-[500px] rounded-4xl shadow-[2px_2px_1px_rgba(0,0,0,0.4)] bg-[var(--background)]">
            <h2 className="text-2xl mb-4">Current Tasks:</h2>
            {tasks.map((task, index) => (
              <label key={index} className="flex justify-center items-center gap-2 bg-[var(--background)] w-[80%] h-14">
                <input type="checkbox" checked={task.completed ?? false} onChange={() => toggleTask(index)} className="inline w-5 h-5" />
                <p className="text-xl font-semibold">{task.name}</p>
                <button onClick={() => deleteTask(index)} className="cursor-pointer w-6 h-6 ml-4 text-md font-bold rounded-full bg-[var(--error)]">
                  <img src="delete-icon.svg"/>
                </button>
              </label>
            ))}
          </div>

          <PrimaryButton text="Add Task" disabled={false}/>
        </div>
    );
};

export default App;