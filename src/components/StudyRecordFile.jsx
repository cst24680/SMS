import { useState } from 'react';

function StudyRecordFile({ onRequest }) {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('study-record.txt');
  const [record, setRecord] = useState(null);
  const [message, setMessage] = useState('');
  const run = async (path, options, successMessage) => {
    try {
      const result = await onRequest(path, options);
      if (result?.fileName) setFileName(result.fileName);
      if (result?.content !== undefined) setRecord(result);
      if (successMessage) setMessage(successMessage);
    } catch (error) { setMessage(error.message); }
  };
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-900">Study record file</h2><p className="mt-1 text-sm text-slate-500">Node.js FS module demonstration for StudyBuddy.</p></div>{record?.fileName ? <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">{record.fileName}</span> : null}</div>
    <textarea value={content} onChange={(event) => setContent(event.target.value)} className="mt-5 min-h-28 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500" placeholder="Example: Revise React hooks for 2 hours today." />
    <div className="mt-3 flex flex-wrap gap-2"><button type="button" className="btn btn-primary" onClick={() => run('/study-record', { method: 'POST', body: JSON.stringify({ content }) }, 'Study record created and written.')}>Create & Write</button><button type="button" className="btn btn-secondary" onClick={() => run('/study-record', {}, 'Study record read successfully.')}>Read</button><button type="button" className="btn btn-secondary" onClick={() => run('/study-record', { method: 'PATCH', body: JSON.stringify({ content }) }, 'Text appended to the study record.')}>Append</button><button type="button" className="btn btn-secondary" onClick={() => run('/study-record', { method: 'DELETE' }, 'Study record file deleted.')}>Delete</button></div>
    <div className="mt-4 flex flex-wrap gap-2"><input value={fileName} onChange={(event) => setFileName(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" aria-label="New record filename" /><button type="button" className="btn btn-secondary" onClick={() => run('/study-record/rename', { method: 'PATCH', body: JSON.stringify({ fileName }) }, 'Study record renamed.')}>Rename file</button></div>
    {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}{record?.content !== undefined ? <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">{record.content}</pre> : null}
  </section>;
}
export default StudyRecordFile;
