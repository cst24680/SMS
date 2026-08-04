function PartnerRequests({ currentUser, users, partnerRequests, onRespond }) {
  const incoming = partnerRequests.filter((request) => request.toUserId === currentUser.id && ['pending', 'sent'].includes(request.status));

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Notifications</p><h3 className="mt-1 text-xl font-semibold text-slate-900">Incoming requests</h3></div>
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-violet-600 px-2 text-sm font-bold text-white">{incoming.length}</span>
      </div>
      <div className="mt-5 space-y-3">
        {incoming.length ? incoming.map((request) => {
          const sender = users.find((user) => user.id === request.fromUserId);
          return <div key={request.id} className="rounded-2xl bg-violet-50 p-4">
            <p className="font-semibold text-slate-900">{sender?.fullName || 'A learner'} wants to study with you.</p>
            <p className="mt-1 text-sm text-slate-600">{sender?.subjects || 'Subjects not listed'} · {sender?.location || 'Location not listed'}</p>
            <div className="mt-4 flex gap-2"><button type="button" onClick={() => onRespond(request, 'accepted')} className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Accept</button><button type="button" onClick={() => onRespond(request, 'rejected')} className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Reject</button></div>
          </div>;
        }) : <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">You have no new study requests.</p>}
      </div>
    </aside>
  );
}

export default PartnerRequests;
