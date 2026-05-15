import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService, type CreateProblemInput } from '../services/admin.service';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import AdminSidebar from '../components/AdminSidebar';
import axios from 'axios';

const parameterSchema = z.object({
  name: z.string().min(1, 'Parameter name required'),
  type: z.string().min(1, 'Parameter type required'),
});

const exampleSchema = z.object({
  input: z.string().optional(),
  output: z.string().optional(),
  explanation: z.string().optional(),
}).refine((data) => {
  // If either input or output is provided, both must be provided
  if ((data.input && !data.output) || (!data.input && data.output)) {
    return false;
  }
  return true;
}, {
  message: "Both input and output are required if an example is provided"
});

const generateStarterCode = (lang: string, signature: any) => {
  const { functionName, parameters, returnType } = signature;
  const params = (parameters || []).map((p: any) => p.name).join(', ');
  
  const mapType = (type: string, targetLang: string) => {
    const t = type.toLowerCase();
    if (targetLang === 'python') {
      if (t === 'number') return 'int';
      if (t === 'string') return 'str';
      if (t === 'boolean') return 'bool';
      if (t === 'void') return 'None';
      if (t === 'array') return 'List[int]';
      if (t === 'object') return 'Dict[str, Any]';
      return 'Any';
    }
    return t;
  };

  switch (lang) {
    case 'python':
      return `class Solution:\n    def ${functionName}(self, ${(parameters || []).map((p: any) => `${p.name}: ${mapType(p.type, 'python')}`).join(', ')}) -> ${mapType(returnType, 'python')}:\n        pass`;
    case 'javascript':
      return `/**\n * @param {any} ${params}\n * @return {${returnType}}\n */\nvar ${functionName} = function(${params}) {\n    \n};`;
    default:
      return '';
  }
};

const testCaseSchema = z.object({
  input: z.string().min(1, 'Input required'),
  output: z.string().min(1, 'Output required'),
  isHidden: z.boolean().optional(),
});

const ALLOWED_LANGUAGES = ['python', 'javascript'] as const;

const problemSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string().min(1)).min(1, 'At least one problem tag is required'),
  companyTags: z.array(z.string()).optional(),
  constraints: z.string().optional(),
  examples: z.array(exampleSchema).optional(),
  functionSignature: z.object({
    functionName: z.string().min(1, 'Function name required'),
    // parameters are optional; empty array means no parameters
    parameters: z.array(parameterSchema),
    returnType: z.string().min(1, 'Return type required'),
  }),
  starterCode: z.record(z.string(), z.string().optional()).optional(),
  testCases: z.array(testCaseSchema).min(1, 'At least one test case required'),
  supportedLanguages: z.array(z.enum(ALLOWED_LANGUAGES)).optional(),
  isPremium: z.boolean().optional(),
});

type ProblemFormData = z.infer<typeof problemSchema>;

const COMMON_RETURN_TYPES = ['number', 'string', 'boolean', 'void', 'any', 'array', 'object'];

const ProblemFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [companyTagInput, setCompanyTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCompanyTags, setSelectedCompanyTags] = useState<string[]>([]);
  const [tagError, setTagError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useForm<ProblemFormData>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'easy',
      isPremium: false,
      examples: [{ input: '', output: '', explanation: '' }],
      testCases: [{ input: '', output: '', isHidden: false }],
      functionSignature: {
        functionName: '',
        parameters: [],
        returnType: '',
      },
      starterCode: {},
    },
  });

  const {
    fields: exampleFields,
    append: appendExample,
    remove: removeExample,
  } = useFieldArray({
    control,
    name: 'examples',
  });

  const {
    fields: testCaseFields,
    append: appendTestCase,
    remove: removeTestCase,
  } = useFieldArray({
    control,
    name: 'testCases',
  });

  const {
    fields: parameterFields,
    append: appendParameter,
    remove: removeParameter,
  } = useFieldArray({
    control,
    name: 'functionSignature.parameters',
  });

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await adminService.getProblemTags();
        setExistingTags(tags);
      } catch {
        // ignore - dropdown will be empty, user can still add new tags
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadProblem(id);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    setValue('tags', selectedTags, { shouldValidate: selectedTags.length > 0 });
    if (selectedTags.length > 0) {
        // Clear errors if there are any now that we have tags
        if (errors.tags) {
            // This forces a revalidation which clears the error if valid
             setValue('tags', selectedTags, { shouldValidate: true });
        }
    }
  }, [selectedTags, setValue, errors.tags]);

  const loadProblem = async (problemId: string) => {
    setIsLoadingData(true);
    try {
      const response = await adminService.getProblem(problemId);
      const problem = response.data;

      setValue('title', problem.title);
      setValue('description', problem.description);
      setValue('difficulty', problem.difficulty);
      setValue('constraints', problem.constraints || '');
      setValue('isPremium', problem.isPremium || false);
      setValue('examples', problem.examples || []);
      setValue('testCases', problem.testCases || []);
      setValue('functionSignature', problem.functionSignature);
      setValue('starterCode', problem.starterCode || {});
      // Normalize supportedLanguages to our allowed set; default to both if empty
      const normalizedSupported =
        (problem.supportedLanguages || []).filter((lang: string) =>
          ALLOWED_LANGUAGES.includes(lang as (typeof ALLOWED_LANGUAGES)[number])
        );
      setValue(
        'supportedLanguages',
        normalizedSupported.length > 0 ? normalizedSupported : [...ALLOWED_LANGUAGES],
      );

      setSelectedTags(problem.tags || []);
      setSelectedCompanyTags(problem.companyTags || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status) {
        if (error.response.status >= 400 && error.response.status < 500) {
          const data = error.response.data as unknown;
          const message =
            typeof data === 'object' && data !== null && 'message' in data
              ? String((data as { message?: unknown }).message || '')
              : 'Failed to load problem';
          showError(message);
        }
      }
      navigate('/admin/problems');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: ProblemFormData) => {
    setIsLoading(true);
    try {
      const cleanedExamples = data.examples?.filter(
        (ex) => ex.input && ex.input.trim() !== '' && ex.output && ex.output.trim() !== ''
      );

      const payload: CreateProblemInput = {
        ...data,
        examples: cleanedExamples && cleanedExamples.length > 0
          ? cleanedExamples.map(ex => ({
              input: ex.input as string,
              output: ex.output as string,
              explanation: ex.explanation
            }))
          : undefined,
        tags: selectedTags,
        companyTags: selectedCompanyTags,
        // Always persist only our two platform languages, even if form state diverges
        supportedLanguages: ALLOWED_LANGUAGES.slice() as unknown as string[],
      };

      if (isEditMode && id) {
        await adminService.updateProblem(id, payload);
        showSuccess('Problem updated successfully');
      } else {
        await adminService.createProblem(payload);
        showSuccess('Problem created successfully');
      }
      navigate('/admin/problems');
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status) {
        if (error.response.status >= 400 && error.response.status < 500) {
          const data = error.response.data as unknown;
          const message =
            typeof data === 'object' && data !== null && 'message' in data
              ? String((data as { message?: unknown }).message || '')
              : 'Failed to save problem';
          showError(message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoGenerateStarterCode = () => {
    const signature = getValues('functionSignature');
    if (!signature.functionName) {
      showError('Please provide a function name first');
      return;
    }

    const currentStarterCode = getValues('starterCode') || {};
    const languages = ['python', 'javascript'];
    
    const newStarterCode = { ...currentStarterCode };
    languages.forEach(lang => {
      if (!newStarterCode[lang] || newStarterCode[lang].trim() === '') {
        newStarterCode[lang] = generateStarterCode(lang, signature);
      }
    });

    setValue('starterCode', newStarterCode);
    showSuccess('Starter code generated for empty languages');
  };

  const TAG_MIN_LEN = 2;
  const TAG_MAX_LEN = 50;
  const TAG_REGEX = /^[a-zA-Z0-9\s\-_]+$/;

  const validateNewTag = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return 'Tag is required';
    if (trimmed.length < TAG_MIN_LEN) return `Tag must be at least ${TAG_MIN_LEN} characters`;
    if (trimmed.length > TAG_MAX_LEN) return `Tag must be at most ${TAG_MAX_LEN} characters`;
    if (!TAG_REGEX.test(trimmed)) return 'Tag can only contain letters, numbers, spaces, hyphens, and underscores';
    return null;
  };

  const handleAddTag = () => {
    const err = validateNewTag(tagInput);
    if (err) {
      setTagError(err);
      showError(err);
      return;
    }
    setTagError(null);
    const normalized = tagInput.trim();
    if (selectedTags.includes(normalized)) {
      showError('Tag already added');
      return;
    }
    setSelectedTags([...selectedTags, normalized]);
    setTagInput('');
    if (!existingTags.includes(normalized)) {
      setExistingTags((prev) => [...prev, normalized].sort());
    }
  };

  const handleSelectExistingTag = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    if (selectedTags.includes(value)) {
      showError('Tag already added');
      e.target.value = '';
      return;
    }
    setSelectedTags([...selectedTags, value]);
    e.target.value = '';
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleAddCompanyTag = () => {
    const value = companyTagInput.trim();
    if (!value) return;
    if (selectedCompanyTags.includes(value)) {
      showError('Company tag already added');
      return;
    }
    setSelectedCompanyTags([...selectedCompanyTags, value]);
    setCompanyTagInput('');
  };

  const handleRemoveCompanyTag = (tag: string) => {
    setSelectedCompanyTags(selectedCompanyTags.filter((t) => t !== tag));
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-black flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-3xl font-bold mb-2">
                {isEditMode ? 'Edit Problem' : 'Create New Problem'}
              </h1>
              <p className="text-gray-400">
                {isEditMode
                  ? 'Update problem details and test cases'
                  : 'Add a new coding challenge to the platform'}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/problems')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2d3a] text-white hover:bg-[#1a1a1a] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 max-w-5xl">
          {/* Problem Title */}
          <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl p-6">
            <h2 className="text-white text-lg font-bold mb-4">Problem Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                  Problem Title
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. Reverse Linked List"
                  className={`w-full rounded-lg bg-[#1a1a1a] border ${
                    errors.title ? 'border-red-500' : 'border-[#2a2d3a]'
                  } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4`}
                />
                {errors.title && (
                  <span className="text-red-500 text-sm mt-1">{errors.title.message}</span>
                )}
              </div>

              {/* Difficulty & Premium */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                    Difficulty
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      {...register('isPremium')}
                      type="checkbox"
                      className="w-5 h-5 rounded bg-[#1a1a1a] border-[#2a2d3a] text-[var(--color-primary)] focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-white text-sm font-medium">Mark as Premium Problem</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Write the problem description using Markdown..."
                  rows={8}
                  className={`w-full rounded-lg bg-[#1a1a1a] border ${
                    errors.description ? 'border-red-500' : 'border-[#2a2d3a]'
                  } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all p-4 font-mono text-sm`}
                />
                {errors.description && (
                  <span className="text-red-500 text-sm mt-1">{errors.description.message}</span>
                )}
              </div>

              {/* Constraints */}
              <div>
                <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                  Constraints <span className="text-gray-500 text-xs normal-case">(Optional)</span>
                </label>
                <textarea
                  {...register('constraints')}
                  placeholder="e.g. 0 ≤ head.length ≤ 5000"
                  rows={4}
                  className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all p-4 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl p-6">
            <h2 className="text-white text-lg font-bold mb-4">Tags</h2>

            <div className="space-y-4">
              {/* Problem Tags */}
              <div>
                <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                  Problem Tags <span className="text-gray-500 text-xs normal-case">(Required)</span>
                </label>
                <p className="text-gray-500 text-xs mb-2">
                  Select from existing tags or add new ones. New tags are saved with the problem.
                  New tags: 2–50 characters, letters, numbers, spaces, hyphens, underscores only.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <select
                    onChange={handleSelectExistingTag}
                    className="h-10 px-4 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all cursor-pointer"
                    defaultValue=""
                  >
                    <option value="">Select existing tag...</option>
                    {existingTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500 text-sm self-center">or</span>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      if (tagError) setTagError(null);
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Type new tag (e.g. Linked List, Array...)"
                    className={`flex-1 min-w-[200px] rounded-lg bg-[#1a1a1a] border ${
                      tagError ? 'border-red-500' : 'border-[#2a2d3a]'
                    } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-10 px-4`}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 h-10 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium transition-all"
                  >
                    Add New
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {tagError && (
                  <span className="text-red-500 text-sm mt-1 block">{tagError}</span>
                )}
                {errors.tags && (
                  <span className="text-red-500 text-sm mt-1 block">{errors.tags.message}</span>
                )}
              </div>

              {/* Company Tags */}
              <div>
                <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                  Company Tags (Optional)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={companyTagInput}
                    onChange={(e) => setCompanyTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCompanyTag())}
                    placeholder="e.g. Google, Amazon..."
                    className="flex-1 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-10 px-4"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompanyTag}
                    className="px-4 h-10 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCompanyTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompanyTag(tag)}
                        className="hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">
                Examples <span className="text-gray-500 text-sm font-normal">(Optional)</span>
              </h2>
              <button
                type="button"
                onClick={() => appendExample({ input: '', output: '', explanation: '' })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Example
              </button>
            </div>

            <div className="space-y-4">
              {exampleFields.map((field, index) => (
                <div key={field.id} className="bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium">Example {index + 1}</h3>
                    {exampleFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExample(index)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Input</label>
                      <input
                        {...register(`examples.${index}.input`)}
                        placeholder='e.g. [1,2,3,4,5]'
                        className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-10 px-3 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Output</label>
                      <input
                        {...register(`examples.${index}.output`)}
                        placeholder='e.g. [5,4,3,2,1]'
                        className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-10 px-3 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-gray-400 text-xs mb-1 block">Explanation (Optional)</label>
                    <textarea
                      {...register(`examples.${index}.explanation`)}
                      placeholder="Explain the example..."
                      rows={2}
                      className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all p-3 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Languages */}
          <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl p-6">
            <h2 className="text-white text-lg font-bold mb-4">
              Supported Languages <span className="text-gray-500 text-sm font-normal">(Optional)</span>
            </h2>
            <p className="text-gray-500 text-xs mb-4">
              Platform currently supports two languages: Python and JavaScript. All problems will use this fixed set.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {ALLOWED_LANGUAGES.map((lang) => (
                <label key={lang} className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a]">
                  <input
                    type="checkbox"
                    value={lang}
                    checked
                    readOnly
                    className="w-5 h-5 rounded bg-[#0f0f0f] border-[#2a2d3a] text-[var(--color-primary)]"
                  />
                  <span className="text-white text-sm capitalize">
                    {lang === 'javascript' ? 'JavaScript' : 'Python'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Function Signature */}
          <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl p-6">
            <h2 className="text-white text-lg font-bold mb-4">Function Signature</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                  Function Name <span className="text-gray-500 text-xs normal-case">(Required)</span>
                </label>
                <input
                  {...register('functionSignature.functionName')}
                  placeholder="e.g. reverseList"
                  className={`w-full rounded-lg bg-[#1a1a1a] border ${
                    errors.functionSignature?.functionName ? 'border-red-500' : 'border-[#2a2d3a]'
                  } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-10 px-4 font-mono`}
                />
                {errors.functionSignature?.functionName && (
                  <span className="text-red-500 text-sm mt-1">{errors.functionSignature.functionName.message}</span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white text-sm font-medium uppercase tracking-wide">
                    Parameters <span className="text-gray-500 text-xs normal-case">(Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => appendParameter({ name: '', type: '' })}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Parameter
                  </button>
                </div>

                <div className="space-y-2">
                  {parameterFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...register(`functionSignature.parameters.${index}.name`)}
                        placeholder="Parameter name"
                        className="flex-1 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-10 px-3 font-mono text-sm"
                      />
                      <input
                        {...register(`functionSignature.parameters.${index}.type`)}
                        placeholder="Type (e.g. ListNode)"
                        className="flex-1 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-10 px-3 font-mono text-sm"
                      />
                      {parameterFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParameter(index)}
                          className="px-3 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                  Return Type <span className="text-gray-500 text-xs normal-case">(Required)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COMMON_RETURN_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setValue('functionSignature.returnType', type)}
                      className="px-2 py-1 rounded-full text-xs font-medium bg-[#1a1a1a] border border-[#2a2d3a] text-gray-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      {type}
                    </button>
                  ))}
                  <span className="text-gray-500 text-xs">
                    Click to select or type a custom return type below
                  </span>
                </div>
                <input
                  {...register('functionSignature.returnType')}
                  placeholder="e.g. ListNode"
                  className={`w-full rounded-lg bg-[#1a1a1a] border ${
                    errors.functionSignature?.returnType ? 'border-red-500' : 'border-[#2a2d3a]'
                  } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-10 px-4 font-mono`}
                />
                {errors.functionSignature?.returnType && (
                  <span className="text-red-500 text-sm mt-1">{errors.functionSignature.returnType.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* Starter Code */}
          <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">
                Starter Code <span className="text-gray-500 text-sm font-normal">(Optional)</span>
              </h2>
              <button
                type="button"
                onClick={handleAutoGenerateStarterCode}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white hover:bg-[#2a2d3a] transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto-generate from Signature
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                  Python
                </label>
                <textarea
                  {...register('starterCode.python')}
                  placeholder="# Definition for singly-linked list.&#10;# class ListNode:&#10;#     def __init__(self, val=0, next=None):&#10;#         self.val = val&#10;#         self.next = next"
                  rows={6}
                  className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all p-4 font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                  JavaScript
                </label>
                <textarea
                  {...register('starterCode.javascript')}
                  placeholder="// Definition for singly-linked list.&#10;// function ListNode(val, next) {&#10;//     this.val = (val===undefined ? 0 : val)&#10;//     this.next = (next===undefined ? null : next)&#10;// }"
                  rows={6}
                  className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all p-4 font-mono text-sm"
                />
              </div>

              
            </div>
          </div>

          {/* Test Cases */}
          <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">
                Test Cases <span className="text-gray-500 text-sm font-normal">(Required)</span>
              </h2>
              <button
                type="button"
                onClick={() => appendTestCase({ input: '', output: '', isHidden: false })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Test Case
              </button>
            </div>

            {errors.testCases && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                At least one test case is required
              </div>
            )}

            <div className="space-y-4">
              {testCaseFields.map((field, index) => (
                <div key={field.id} className="bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium">Test Case {index + 1}</h3>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          {...register(`testCases.${index}.isHidden`)}
                          type="checkbox"
                          className="w-4 h-4 rounded bg-[#0f0f0f] border-[#2a2d3a] text-[var(--color-primary)] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-gray-400 text-sm">Hidden</span>
                      </label>
                      {testCaseFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Input</label>
                      <textarea
                        {...register(`testCases.${index}.input`)}
                        placeholder='{"head": [1,2,3,4,5]}'
                        rows={3}
                        className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all p-3 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Output</label>
                      <textarea
                        {...register(`testCases.${index}.output`)}
                        placeholder='[5,4,3,2,1]'
                        rows={3}
                        className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all p-3 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 sticky bottom-0 bg-black py-4 border-t border-[#1c1c1c]">
            <button
              type="button"
              onClick={() => navigate('/admin/problems')}
              className="flex-1 h-12 rounded-lg border border-[#2a2d3a] text-white font-medium hover:bg-[#1a1a1a] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Problem' : 'Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemFormPage;