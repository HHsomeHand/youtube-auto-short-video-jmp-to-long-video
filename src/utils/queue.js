let queue = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || queue.length === 0) return;

    isProcessing = true;
    const task = queue.shift();

    await task();

    isProcessing = false;
    await processQueue();
}

function addToQueue(task) {
    queue.push(task);
    processQueue();
}

export { addToQueue };
