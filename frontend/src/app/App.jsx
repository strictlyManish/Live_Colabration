import "./App.css";
import { useRef, useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Editor } from "@monaco-editor/react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { MonacoBinding } from "y-monaco";

const SERVER_URL = "http://localhost:3000";
const ROOM_NAME = "monaco-demo-room";

function App() {
  const [editor, setEditor] = useState(null);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  const { register, handleSubmit, formState: { errors } } = useForm();

  // 1. Stable Yjs Document
  const ydoc = useMemo(() => new Y.Doc(), []);
  const ytext = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  // 2. Handle Editor Mount
  const handleEditorDidMount = (editorInstance) => {
    setEditor(editorInstance);
  };

  // 3. Collaborative Logic Engine
  useEffect(() => {
    if (!username || !editor) return;

    // Initialize Provider
    const provider = new SocketIOProvider(SERVER_URL, ROOM_NAME, ydoc, {
      autoConnect: true,
    });

    // Set local identity in Awareness
    provider.awareness.setLocalStateField("user", {
      username,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random user color
    });

    // Bind Yjs to Monaco
    const binding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    // Track active users
    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const active = states
        .filter((s) => s.user && s.user.username)
        .map((s) => s.user);
      setUsers(active);
    };

    provider.awareness.on("change", updateUsers);

    // Cleanup on unmount
    return () => {
      binding.destroy();
      provider.disconnect();
      provider.awareness.off("change", updateUsers);
    };
  }, [username, editor, ydoc, ytext]);

  const onJoin = (data) => {
    setUsername(data.username);
    const url = new URL(window.location);
    url.searchParams.set("username", data.username);
    window.history.pushState({}, "", url);
  };

  // --- Render Join Screen ---
  if (!username) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full bg-[#09090b] text-white">
        <div className="w-full max-w-sm p-8 bg-[#18181b] rounded-xl border border-white/10 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2 text-center">CollabEdit</h1>
          <p className="text-gray-400 text-sm text-center mb-8">Enter a name to start coding together</p>
          
          <form onSubmit={handleSubmit(onJoin)} className="space-y-4">
            <div>
              <input
                {...register("username", { required: "Username is required", minLength: 2 })}
                placeholder="Username"
                className="w-full bg-[#09090b] border border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors">
              Join Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Render Editor Workspace ---
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#09090b] p-2 gap-2 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#18181b] rounded-lg border border-white/5 flex flex-col p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Users</h2>
          <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] rounded-full border border-green-500/20">
            {users.length} Live
          </span>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {users.map((user, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors">
              <div 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: user.color || '#22c55e' }}
              />
              <span className="text-sm text-gray-300 font-medium">
                {user.username} {user.username === username && <span className="text-[10px] opacity-40 ml-1">(You)</span>}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">File</div>
          <div className="text-sm text-blue-400 bg-blue-500/5 p-2 rounded border border-blue-500/20">
            main.js
          </div>
        </div>
      </aside>

      {/* Monaco Container */}
      <main className="flex-1 bg-[#18181b] rounded-lg border border-white/5 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            automaticLayout: true,
            fontSize: 14,
            fontFamily: "'Fira Code', monospace",
            padding: { top: 20 },
            minimap: { enabled: false },
            cursorSmoothCaretAnimation: "on",
            roundedSelection: true,
            scrollbar: {
              vertical: "hidden",
              horizontal: "hidden"
            }
          }}
        />
      </main>
    </div>
  );
}

export default App;