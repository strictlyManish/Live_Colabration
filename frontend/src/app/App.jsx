import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const editorRef = useRef(null);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const ytext = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    // ✅ correctly assign ref
    editorRef.current = editor;

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco-demo-room",
      ydoc,
      { autoConnect: true }
    );

    // ✅ use editor directly instead of ref
    new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );
  };

  return (
    <main className="bg-gray-950 min-h-screen w-full flex flex-col md:flex-row gap-2 p-2">
      {/* Sidebar */}
      <aside className="bg-gray-900 rounded-md w-full md:w-1/4 h-40 md:h-auto">
        {/* Sidebar content */}
      </aside>

      {/* Editor Section */}
      <section className="bg-[#09090B] rounded-md flex-1 h-[70vh] md:h-auto">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// write your code here"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;