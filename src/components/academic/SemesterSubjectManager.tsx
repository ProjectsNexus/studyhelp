import React, { useState } from "react";
import {
  Layers,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Modal } from "../common/Modal";
import { Badge } from "../common/Badge";
import { useAuth } from "../../context/AuthContext";
import { SemesterProfile, SubjectProfile } from "../../types";

export const SemesterSubjectManager: React.FC = () => {
  const {
    semesters,
    subjects,
    addSemester,
    updateSemester,
    deleteSemester,
    addSubject,
    updateSubject,
    deleteSubject,
    activeSemester,
    activeSubject,
    setActiveSemesterId,
    setActiveSubjectId,
  } = useAuth();

  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [selectedSemesterForSubject, setSelectedSemesterForSubject] = useState<string>("");

  const [semNum, setSemNum] = useState<number>(1);
  const [semName, setSemName] = useState<string>("");
  const [semDesc, setSemDesc] = useState<string>("");

  const [subName, setSubName] = useState<string>("");
  const [subCode, setSubCode] = useState<string>("");
  const [subDesc, setSubDesc] = useState<string>("");
  const [subObjectives, setSubObjectives] = useState<string>("");

  const handleSaveSemester = async () => {
    if (!semName.trim()) return;
    await addSemester({
      semesterNumber: semNum,
      name: semName.trim(),
      description: semDesc.trim() || undefined,
    });
    setIsAddingSemester(false);
    setSemName("");
    setSemDesc("");
  };

  const handleSaveSubject = async () => {
    if (!subName.trim() || !selectedSemesterForSubject) return;
    const objectives = subObjectives
      ? subObjectives.split("\n").map((s) => s.trim()).filter(Boolean)
      : undefined;

    await addSubject({
      semesterId: selectedSemesterForSubject,
      name: subName.trim(),
      courseCode: subCode.trim() || undefined,
      description: subDesc.trim() || undefined,
      learningObjectives: objectives,
    });

    setIsAddingSubject(false);
    setSubName("");
    setSubCode("");
    setSubDesc("");
    setSubObjectives("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Academic Semesters & Courses</h2>
          <p className="text-xs text-slate-500">
            Structure your coursework to tailor universal AI research to specific course objectives.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setSemNum(semesters.length + 1);
            setIsAddingSemester(true);
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Semester
        </Button>
      </div>

      {/* Semester List */}
      <div className="space-y-4">
        {semesters.map((sem) => {
          const semSubjects = subjects.filter((s) => s.semesterId === sem.id);
          const isActive = activeSemester?.id === sem.id;

          return (
            <Card
              key={sem.id}
              className={`p-4 sm:p-5 border space-y-3 ${
                isActive ? "border-indigo-300 ring-1 ring-indigo-500/20 bg-white" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    S{sem.semesterNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">{sem.name}</h3>
                      {isActive && (
                        <Badge variant="university" size="sm">
                          Current Term
                        </Badge>
                      )}
                    </div>
                    {sem.description && <p className="text-xs text-slate-500">{sem.description}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isActive && sem.id && (
                    <button
                      onClick={() => setActiveSemesterId(sem.id!)}
                      className="text-xs text-indigo-600 font-semibold hover:bg-indigo-50 px-2 py-1 rounded-lg"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedSemesterForSubject(sem.id!);
                      setIsAddingSubject(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                    title="Add Course"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {sem.id && (
                    <button
                      onClick={() => deleteSemester(sem.id!)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Semester"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Course Subjects within Semester */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Enrolled Subjects ({semSubjects.length})
                </span>

                {semSubjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {semSubjects.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {sub.courseCode && (
                              <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-700">
                                {sub.courseCode}
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {sub.name}
                            </span>
                          </div>
                          {sub.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {sub.description}
                            </p>
                          )}
                        </div>

                        {sub.id && (
                          <button
                            onClick={() => deleteSubject(sub.id!)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedSemesterForSubject(sem.id!);
                      setIsAddingSubject(true);
                    }}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Courses to {sem.name}</span>
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal: Add Semester */}
      <Modal
        isOpen={isAddingSemester}
        onClose={() => setIsAddingSemester(false)}
        title="Add Semester"
      >
        <div className="space-y-4">
          <Input
            label="Semester Number"
            type="number"
            value={semNum}
            onChange={(e) => setSemNum(Number(e.target.value))}
            required
          />
          <Input
            label="Semester Title / Academic Term"
            placeholder="e.g. Spring 2026 or Semester 5"
            value={semName}
            onChange={(e) => setSemName(e.target.value)}
            required
          />
          <Input
            label="Description (Optional)"
            placeholder="e.g. Advanced core systems and elective coursework"
            value={semDesc}
            onChange={(e) => setSemDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setIsAddingSemester(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleSaveSemester} disabled={!semName.trim()}>
              Save Semester
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Add Subject */}
      <Modal
        isOpen={isAddingSubject}
        onClose={() => setIsAddingSubject(false)}
        title="Add Course / Subject"
      >
        <div className="space-y-4">
          <Input
            label="Course / Subject Name"
            placeholder="e.g. Database Systems, Quantum Mechanics, Macroeconomics"
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            required
          />
          <Input
            label="Course Code (Optional)"
            placeholder="e.g. CS 334, PHYS 201"
            value={subCode}
            onChange={(e) => setSubCode(e.target.value)}
          />
          <Input
            label="Course Overview (Optional)"
            placeholder="e.g. Relational database models, normal forms, and query optimization"
            value={subDesc}
            onChange={(e) => setSubDesc(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Learning Objectives (One per line)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Master Boyce-Codd Normal Form&#10;Implement ACID transactions"
              value={subObjectives}
              onChange={(e) => setSubObjectives(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={() => setIsAddingSubject(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={handleSaveSubject} disabled={!subName.trim()}>
              Save Course
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
