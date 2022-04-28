importScripts('https://cdn.jsdelivr.net/pyodide/dev/full/pyodide.js');

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide();
}

const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;

  const { action, message } = event.data;
  try {
    switch (action) {
      case 'runPython': {
        await self.pyodide.loadPackagesFromImports(message);
        const results = await self.pyodide.runPythonAsync(message);
        event.ports[0].postMessage({ results });
        break;
      }
      case 'unpack': {
        self.pyodide.unpackArchive(message.buffer, message.format);
        event.ports[0].postMessage({ results: null });
        break;
      }
      case 'readFile': {
        const blob = new Blob([self.pyodide.FS.readFile(message.path)], { type: message.type });
        event.ports[0].postMessage({ results: blob });
        break;
      }
      case 'writeFile': {
        self.pyodide.FS.writeFile(message.path, message.buffer, { flags: 'w' });
        event.ports[0].postMessage({ results: null });
        break;
      }
      default:
        event.ports[0].postMessage({ results: null });
    }
  } catch (error) {
    event.ports[0].postMessage({ error: error.message });
  }
};
