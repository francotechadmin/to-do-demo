// app/home/page (or wherever your page is)
"use client";
import { useState, useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import config from "../aws-exports"; // auto-generated by Amplify

import NavBar from "./components/NavBar";
import WelcomeModal from "./components/WelcomeModal";
import AiFeatureModal from "./components/AIModal";
import AddTaskForm from "./components/AddTaskForm";
import GenerateTasksButton from "./components/GenerateTasksButton";
import TaskList from "./components/TaskList";
import Loader from "./components/Loader";

import { useSubscription } from "./hooks/useSubscriptionStatus";
import { useFetchTasks } from "./hooks/useFetchTasks";
import { useMutateTasks } from "./hooks/useMutateTasks";
import { handleCreateUser } from "./hooks/useUser";

// Configure Amplify
const libraryOptions = { ssr: false };
Amplify.configure({ ...config, ...libraryOptions });

// ======== MAIN COMPONENT ========
function Home() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const { data: tasks = [], isLoading } = useFetchTasks();
  const { addTask, editTask, removeTask, clearTasks, bulkReplaceTasks } =
    useMutateTasks();

  const [newTask, setNewTask] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);

  const { handleSubscribe, isCreatingSession } = useSubscription();

  // Ensure the user record exists on mount
  useEffect(() => {
    handleCreateUser(setShowWelcomeModal);
  }, []);

  // Handle form submission for adding a task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask(newTask.trim());
    setNewTask("");
  };

  return (
    <div className="flex flex-col justify-center flex-1 min-h-0 p-4 w-full max-w-4xl">
      {/* NAV BAR at the top */}
      <NavBar />

      {/* Optional "Welcome" overlay if user is brand new */}
      {showWelcomeModal && (
        <WelcomeModal
          onClose={() => setShowWelcomeModal(false)}
          onSubscribe={handleSubscribe}
          isCreatingSession={isCreatingSession}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col items-center justify-start max-w-90 pt-8 flex-1 min-h-0 w-full">
        {/* ADD TASK FORM */}
        <AddTaskForm
          newTask={newTask}
          setNewTask={setNewTask}
          onAddTask={handleAddTask}
        />

        {/* GENERATE TASKS (PRO Feature) */}
        <GenerateTasksButton onClick={() => setShowAiModal(true)} />

        {/* AI MODAL */}
        <AiFeatureModal
          open={showAiModal}
          onClose={() => setShowAiModal(false)}
          onSave={bulkReplaceTasks}
        />

        {/* TASK LIST OR LOADER */}
        {isLoading ? (
          <div className="text-gray-600 h-full flex items-center justify-center">
            <Loader color="white" />
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onEditTask={editTask}
            onRemoveTask={removeTask}
          />
        )}

        {/* CLEAR ALL TASKS */}
        {tasks.length > 0 && !isLoading && (
          <button
            onClick={() => clearTasks()}
            className="text-red-500 hover:underline mt-4"
          >
            Clear all tasks
          </button>
        )}
      </div>
    </div>
  );
}

// Export withAuthenticator if you want Amplify’s login flow
export default withAuthenticator(Home);
