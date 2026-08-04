function Profile({ profile }) {
  if (!profile) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Profile</h3>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p><span className="font-semibold text-slate-800">Name:</span> {profile.fullName}</p>
        <p><span className="font-semibold text-slate-800">Email:</span> {profile.email}</p>
        <p><span className="font-semibold text-slate-800">Age:</span> {profile.age || 'Not set'}</p>
        <p><span className="font-semibold text-slate-800">Institution:</span> {profile.institution || 'Not set'}</p>
        <p><span className="font-semibold text-slate-800">Subjects:</span> {profile.subjects || 'Not set'}</p>
        <p><span className="font-semibold text-slate-800">Location:</span> {profile.location || 'Not set'}</p>
        <p><span className="font-semibold text-slate-800">Study setting:</span> {profile.studyMode || 'Not set'}</p>
      </div>
    </section>
  );
}

export default Profile;
