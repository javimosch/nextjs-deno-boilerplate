"use client";

import { useState, useRef } from 'react';

export default function GroqTranscribePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [modules, setModules] = useState('location,events,diagnostics');
  const [systemPrompt, setSystemPrompt] = useState(`Respond with parseable JSON (valid for JSON.parse)

BAD:
Based on the user query 'Event', the module name to redirect to would be 'Events' or 'EventManagement'. However, a more specific and commonly used module name would be 'Calendar'.

GOOD:
{moduleName:"events"}`);
  const [prompt, setPrompt] = useState('Return the module name to redirect to based on the user query: $QUERY');
  const [redirectModule, setRedirectModule] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await sendAudioForTranscription(audioBlob);
        audioChunks.current = [];
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error accessing microphone: ${errorMessage}. Please ensure permissions are granted.`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');

      const transcriptionResponse = await fetch('/api/functions/groqTranscription', {
        method: 'POST',
        body: formData,
      });

      if (!transcriptionResponse.ok) {
        throw new Error('Transcription failed');
      }

      const transcriptionResult = await transcriptionResponse.json();
      setTranscription(transcriptionResult.text || transcriptionResult);

      // Call completion API with transcription result
      const completionResponse = await fetch('/api/functions/groqCompletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt: systemPrompt+`
          
          Possible modules names: ${modules}
          `,
          prompt: prompt.replace('$QUERY', transcriptionResult.text || transcriptionResult)
        }),
      });

      if (!completionResponse.ok) {
        throw new Error('Completion failed');
      }

      const completionResult = await completionResponse.json();
      setRedirectModule(completionResult.moduleName||JSON.stringify(completionResult));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error during processing: ${errorMessage}. Please try again.`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Voice to Module</h1>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Stop Recording
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid gap-4 mb-4">
        <div>
          <label className="block mb-2">Modules (comma separated)</label>
          <input
            type="text"
            value={modules}
            onChange={(e) => setModules(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full h-32 p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-2 border rounded"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Transcription</label>
        <textarea
          value={transcription}
          readOnly
          className="w-full h-32 p-2 border rounded"
          placeholder="Transcription will appear here..."
        />
      </div>

      <div>
        <label className="block mb-2">Module to redirect to</label>
        <input
          type="text"
          value={redirectModule}
          readOnly
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>
    </div>
  );
}