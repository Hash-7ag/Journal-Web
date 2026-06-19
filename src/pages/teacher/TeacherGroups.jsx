import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../scripts/api.js';
import { FiBook, FiUsers, FiArrowRight } from 'react-icons/fi';

function TeacherGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const res = await api.get('/teacher/getMyGroups');
        setGroups(res.data ?? []);
      } catch (err) {
        setError(err.message || 'Yükləmə xətası');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const groupColors = [
    'from-[#8B5CF6] to-[#3B82F6]',
    'from-[#3B82F6] to-[#60A5FA]',
    'from-[#8B5CF6] to-[#A78BFA]',
    'from-[#6366F1] to-[#8B5CF6]',
    'from-[#3B82F6] to-[#8B5CF6]',
    'from-[#A78BFA] to-[#60A5FA]',
  ];

  const subjectColors = [
    'from-[#8B5CF6] to-[#A78BFA]',
    'from-[#3B82F6] to-[#60A5FA]',
    'from-[#6366F1] to-[#8B5CF6]',
    'from-[#A78BFA] to-[#60A5FA]',
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div role="alert" className="alert alert-error max-w-sm rounded-xl">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-lg font-bold">Mənim Qruplarım</h1>
        <p className="text-xs opacity-40 mt-0.5">Tədris etdiyiniz qruplar və fənlər</p>
      </div>

      {groups.length === 0 ? (
        <div className="text-center opacity-40 mt-20 text-sm">Heç bir qrup tapılmadı</div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group, groupIndex) => {
            const groupColor = groupColors[groupIndex % groupColors.length];

            // Filter only subjects that belong to this teacher (already filtered by backend)
            const mySubjects = group.subjects ?? [];

            return (
              <div key={group._id} className="bg-base-100 border border-base-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Group header */}
                <div className="px-5 py-4 flex items-center gap-4 border-b border-base-200">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${groupColor} flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0`}
                  >
                    {group.groupNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{group.profession}</div>
                    <div className="text-xs opacity-30 font-mono tracking-widest mt-0.5">#{group.groupShifr}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs opacity-40">
                    <FiUsers size={13} />
                    {group.students?.length ?? 0} şagird
                  </div>
                </div>

                {/* Subjects list */}
                <div className="p-4 flex flex-col gap-2">
                  {mySubjects.length === 0 ? (
                    <div className="text-xs opacity-30 text-center py-4">Fənn tapılmadı</div>
                  ) : (
                    mySubjects.map((item, subIndex) => {
                      const subject = item.subject ?? item;
                      const subColor = subjectColors[subIndex % subjectColors.length];
                      return (
                        <button
                          key={subject._id ?? subIndex}
                          onClick={() => navigate(`/teacher/groups/${group._id}/${subject._id}`)}
                          className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-transparent bg-base-200/40 hover:bg-base-200/70 hover:border-[#8B5CF6]/30 transition-all duration-200 text-left"
                        >
                          <div
                            className={`w-9 h-9 rounded-lg bg-gradient-to-br ${subColor} flex items-center justify-center text-white shadow-sm shrink-0`}
                          >
                            <FiBook size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{subject.subject ?? '—'}</div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {subject.semestr && (
                                <span className="text-xs opacity-40">{subject.semestr}-ci semestr</span>
                              )}
                              {subject.kredit && <span className="text-xs opacity-40">{subject.kredit} kredit</span>}
                              {subject.totalHours && (
                                <span className="text-xs opacity-40">{subject.totalHours} saat</span>
                              )}
                            </div>
                          </div>
                          <FiArrowRight
                            size={13}
                            className="opacity-20 group-hover:opacity-60 transition-opacity duration-200 shrink-0"
                          />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TeacherGroups;
