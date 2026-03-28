import "./App.css"
import {Editor} from "@monaco-editor/react";

function App() {
  return (
    <main  className="bg-gray-950 h-screen w-full flex gap-2 p-2">
        <aside className="h-full w-1/4 bg-gray-900 rounded-md">

        </aside>
        <section className="h-full w-3/4 bg-gray-900 rounded-md">
            <Editor
            heigth="100%"
            defualtLanguage="javascript"
            defaulttValue="// write your code here"
            theme="vs-dark"
            />
        </section>
    </main>
  )
}

export default App