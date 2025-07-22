import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Auth Debug</title>
    </head>
    <body style="font-family: monospace; padding: 20px; background: #000; color: #fff;">
        <h1>Authentication Debug</h1>
        <div id="debug-info"></div>
        
        <script>
            const debugInfo = document.getElementById('debug-info');
            
            // Check localStorage
            const token = localStorage.getItem('auth_token');
            
            debugInfo.innerHTML = \`
                <h2>LocalStorage Token:</h2>
                <p><strong>Token exists:</strong> \${token ? 'YES' : 'NO'}</p>
                \${token ? \`<p><strong>Token:</strong> \${token.substring(0, 50)}...</p>\` : ''}
                
                <h2>Test API Call:</h2>
                <button onclick="testApiCall()">Test /api/auth/me</button>
                <div id="api-result"></div>
            \`;
            
            window.testApiCall = async function() {
                const result = document.getElementById('api-result');
                const token = localStorage.getItem('auth_token');
                
                if (!token) {
                    result.innerHTML = '<p style="color: red;">No token found in localStorage</p>';
                    return;
                }
                
                try {
                    const response = await fetch('/api/auth/me', {
                        headers: {
                            'Authorization': \`Bearer \${token}\`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const data = await response.json();
                    
                    result.innerHTML = \`
                        <p><strong>Status:</strong> \${response.status}</p>
                        <p><strong>Response:</strong></p>
                        <pre>\${JSON.stringify(data, null, 2)}</pre>
                    \`;
                } catch (error) {
                    result.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
                }
            };
        </script>
    </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
