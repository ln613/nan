import axios from 'axios'
import { tap } from '.'

/**
 * Chat with OpenAI's ChatGPT using the chat completion API
 * @param {string} message - The user's message
 * @param {Object} options - Configuration options
 * @param {string} options.model - The model to use (default: gpt-4-turbo)
 * @param {number} options.temperature - Control randomness (0-2, default: 0.7)
 * @param {number} options.maxTokens - Maximum tokens in response (default: 1000)
 * @param {Array} options.history - Previous conversation history
 * @returns {Promise<Object>} - The API response with generated content
 */
export const chatWithOpenAI = async (message, options = {}) => {
  try {
    const {
      model = 'gpt-4-turbo',
      temperature = 0.7,
      maxTokens = 1000,
      history = []
    } = options

    // Prepare the messages array with history and new message
    const messages = [
      ...history,
      { role: 'user', content: message }
    ]

    // Make request to OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    )

    // Return the complete response for flexibility
    return response.data
  } catch (error) {
    console.error('Error chatting with OpenAI:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Simple function to get just the response text from OpenAI
 * @param {string} message - The user's message
 * @param {Object} options - Configuration options (same as chatWithOpenAI)
 * @returns {Promise<string>} - Just the response text
 */
export const getOpenAIResponse = async (message, options = {}) => {
  const response = await chatWithOpenAI(message, options)
  return response.choices[0].message.content
}

/**
 * Ask questions about a file using OpenAI
 * @param {Buffer|string} fileContent - The file content (Buffer) or base64 string
 * @param {string} fileName - The name of the file
 * @param {string} question - The question to ask about the file
 * @param {Object} options - Configuration options
 * @param {string} options.model - The model to use (default: gpt-4-vision-preview for images/pdfs, gpt-4-turbo for text)
 * @param {string} options.assistantId - The OpenAI Assistant ID to use for Excel files (defaults to OPENAI_ASSISTANT_ID env var)
 * @param {number} options.temperature - Control randomness (0-2, default: 0.7)
 * @param {number} options.maxTokens - Maximum tokens in response (default: 1000)
 * @note For Excel files (xlsx, xls, csv), OpenAI's file upload API is used with an assistant
 * @param {number} options.temperature - Control randomness (0-2, default: 0.7)
 * @param {number} options.maxTokens - Maximum tokens in response (default: 1000)
 * @returns {Promise<Object>} - The API response with generated content
 */
export const askAboutFile = async (fileContent, fileName, question, options = {}) => {
  try {
    // Convert string to Buffer if needed
    const fileBuffer = typeof fileContent === 'string'
      ? Buffer.from(fileContent, 'base64')
      : fileContent
    
    const fileType = fileName.split('.').pop().toLowerCase()
    
    // Handle Excel files with OpenAI File Upload API
    if (['xlsx', 'xls', 'csv'].includes(fileType)) {
      // First, upload the file to OpenAI
      const form = new FormData()
      const blob = new Blob([fileBuffer], {
        type: fileType === 'csv'
          ? 'text/csv'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      form.append('file', blob, fileName)
      form.append('purpose', 'assistants')
      
      // Upload file to OpenAI
      const uploadResponse = await axios.post(
        'https://api.openai.com/v1/files',
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      )
      
      const fileId = uploadResponse.data.id
      
      // First create an empty thread
      const threadResponse = await axios.post(
        'https://api.openai.com/v1/threads',
        {},  // Empty thread
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      )
      
      const threadId = threadResponse.data.id
      
      // Then add a message with the file attachment using the content array format
      await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/messages`,
        {
          role: 'user',
          content: [
            {
              type: "text",
              text: question
            },
            {
              type: "file_attachment",
              file_id: fileId
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      )
      
      // Run the thread with assistant
      const runResponse = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        {
          assistant_id: options.assistantId || process.env.OPENAI_ASSISTANT_ID,
          model: options.model || 'gpt-4-turbo'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      )
      
      const runId = runResponse.data.id
      
      // Poll for completion
      let runStatus = 'queued'
      let attempts = 0
      const maxAttempts = 30 // Timeout after 30 attempts (approximately 30 seconds)
      
      while (runStatus !== 'completed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        
        const statusResponse = await axios.get(
          `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'OpenAI-Beta': 'assistants=v2'
            }
          }
        )
        
        runStatus = statusResponse.data.status
        attempts++
        
        if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
          throw new Error(`Run ${runStatus}: ${statusResponse.data.last_error?.message || 'Unknown error'}`)
        }
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Timeout waiting for OpenAI to process the file')
      }
      
      // Get the messages
      const messagesResponse = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      )
      
      // Find the assistant's response
      const assistantMessage = messagesResponse.data.data.find(msg => msg.role === 'assistant')
      
      // Clean up - delete the file
      await axios.delete(
        `https://api.openai.com/v1/files/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      )
      
      // Return format similar to chat completions
      return {
        choices: [
          {
            message: {
              role: 'assistant',
              content: assistantMessage.content[0].text.value
            }
          }
        ]
      }
    }
    
    // Default to appropriate model based on file type
    const defaultModel = ['png', 'jpg', 'jpeg', 'gif', 'pdf'].includes(fileType)
      ? 'gpt-4-vision-preview'
      : 'gpt-4-turbo'
    
    const {
      model = defaultModel,
      temperature = 0.7,
      maxTokens = 1000
    } = options

    let messages = []
    
    // Handle different file types
    if (['png', 'jpg', 'jpeg', 'gif'].includes(fileType)) {
      // For images, use base64 encoding with vision model
      const base64Image = fileBuffer.toString('base64')
      messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: question },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/${fileType};base64,${base64Image}`
              }
            }
          ]
        }
      ]
    } else if (fileType === 'pdf') {
      // For PDFs, use base64 encoding with vision model
      const base64Pdf = fileBuffer.toString('base64')
      messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: question },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64Pdf}`
              }
            }
          ]
        }
      ]
    } else {
      // For regular text files, include the content directly in the message
      const textContent = fileBuffer.toString('utf-8')
      messages = [
        {
          role: 'user',
          content: `I have the following file (${fileName}):\n\n${textContent}\n\n${question}`
        }
      ]
    }

    // Make request to OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    )

    // Return the complete response for flexibility
    return response.data
  } catch (error) {
    console.error('Error asking about file with OpenAI:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Simple function to get just the response text when asking about a file
 * @param {Buffer|string} fileContent - The file content (Buffer) or base64 string
 * @param {string} fileName - The name of the file
 * @param {string} question - The question to ask about the file
 * @param {Object} options - Configuration options (same as askAboutFile)
 * @returns {Promise<string>} - Just the response text
 */
export const getFileQuestionResponse = async (fileContent, fileName, question, options = {}) => {
  const response = await askAboutFile(fileContent, fileName, question, options)
  return response.choices[0].message.content
}