// Service to handle live Notion API interaction (2-way sync)
// Uses Vite proxy /api/notion -> https://api.notion.com

function formatNotionUuid(id) {
  if (!id) return id;
  const clean = id.replace(/-/g, '');
  if (clean.length === 32) {
    return `${clean.slice(0,8)}-${clean.slice(8,12)}-${clean.slice(12,16)}-${clean.slice(16,20)}-${clean.slice(20)}`;
  }
  return id;
}

export async function fetchNotionComments(token, pageId) {
  const authToken = token || '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';
  const targetPageId = formatNotionUuid(pageId);
  if (!targetPageId) return [];

  try {
    const response = await fetch(`/api/notion/v1/comments?block_id=${targetPageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    const results = data.results || [];
    return results.map(r => {
      const textArr = r.rich_text || [];
      const textContent = textArr.map(t => t.plain_text || '').join('');
      const authorName = r.created_by?.name || 'Diego Musach';
      const createdTime = (r.created_time || '').replace('T', ' ').slice(0, 16);
      return {
        author: authorName,
        date: createdTime,
        text: textContent
      };
    }).filter(c => c.text.trim());
  } catch (error) {
    console.error("Error fetching Notion comments:", error);
    return [];
  }
}

export async function fetchNotionDatabase(token, databaseId) {
  if (!token || !databaseId) {
    throw new Error("Token o Database ID no configurados");
  }

  const cleanDbId = databaseId.replace(/-/g, '');
  const response = await fetch(`/api/notion/v1/databases/${cleanDbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Notion API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}

export async function postCommentToNotion(token, pageId, commentText) {
  const authToken = token || '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';
  const targetPageId = formatNotionUuid(pageId);

  if (!targetPageId) {
    console.warn("No pageId provided, saved locally only.");
    return { success: true, localOnly: true };
  }

  try {
    const response = await fetch('/api/notion/v1/comments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { page_id: targetPageId },
        rich_text: [
          {
            text: {
              content: commentText
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Notion API Error posting comment:", err);
      return { success: false, error: err.message || response.statusText };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Failed to post comment to Notion:", error);
    return { success: false, error: error.message };
  }
}

export async function updateNotionPageStatus(token, pageId, newStatus) {
  const authToken = token || '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';
  const targetPageId = formatNotionUuid(pageId);

  if (!targetPageId) {
    return { success: true, localOnly: true };
  }

  try {
    const response = await fetch(`/api/notion/v1/pages/${targetPageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          'Status 1': {
            select: { name: newStatus }
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Notion API Error updating status:", err);
      return { success: false, error: err.message || response.statusText };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Failed to update status in Notion:", error);
    return { success: false, error: error.message };
  }
}

export async function createNotionPage(token, databaseId, pageData) {
  const cleanDbId = (databaseId || '34ace95d-6a9a-8054-b33b-cad2cbaf4c70').replace(/-/g, '');
  const authToken = token || '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';

  try {
    const response = await fetch('/api/notion/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: cleanDbId },
        properties: {
          Name: {
            title: [
              { text: { content: pageData.title } }
            ]
          },
          joseph: {
            select: { name: pageData.responsable }
          },
          'Status 1': {
            select: { name: pageData.status || 'Abierto' }
          },
          Prioridad: {
            select: { name: pageData.priority || 'P2 - ALTA' }
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Notion API Create Page Error:", err);
      return { success: false, error: err.message || response.statusText };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Failed to create page in Notion:", error);
    return { success: false, error: error.message };
  }
}
