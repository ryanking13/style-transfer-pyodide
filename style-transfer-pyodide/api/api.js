async function sendMessage(worker, action, message, transfer) {
  return new Promise((res, rej) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = ({ data }) => {
      channel.port1.close();
      if (data.error) {
        rej(data.error);
      } else {
        res(data.results);
      }
    };

    let transfers = [channel.port2];
    if (transfer !== undefined) {
      transfers = transfers.concat(transfer);
    }

    worker.postMessage({
      action,
      message,
    }, transfers);
  });
}

async function runScript(worker, script) {
  return sendMessage(worker, 'runPython', script);
}

async function unpack(worker, obj) {
  return sendMessage(
    worker,
    'unpack',
    {
      buffer: obj,
      format: 'gztar',
    },
    [obj],
  );
}

async function readFile(worker, path, type) {
  return sendMessage(
    worker,
    'readFile',
    {
      path,
      type,
    },
  );
}

async function writeFile(worker, path, buffer) {
  return sendMessage(
    worker,
    'writeFile',
    {
      path,
      buffer,
    },
  );
}

export default {
  sendMessage,
  runScript,
  unpack,
  readFile,
  writeFile,
};
