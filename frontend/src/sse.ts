export const eventSource = new EventSource('/api/events');

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'update':
            console.log('Data update received:', data.message);
            // Reload the page to show updated data
            window.location.reload();
            break;
        case 'error':
            console.error('SSE error received:', data.message, data.error);
            // You could show a toast notification here instead of just logging
            break;
        case 'connection':
            console.log('SSE connection established:', data.message);
            break;
        case 'heartbeat':
            // Optional: handle heartbeat events
            break;
        default:
            console.log('Unknown SSE event type:', data);
    }
}

eventSource.onerror = (event) => {
  console.error('EventSource failed:', event);
}

eventSource.onopen = () => {
  console.log('EventSource opened');
}