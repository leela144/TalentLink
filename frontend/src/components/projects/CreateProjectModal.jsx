// src/components/projects/CreateProjectModal.jsx
import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { projectAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { FiX } from 'react-icons/fi' // Remove FiPlus, FiTrash2 since we don't need them anymore
import SkillSearch from '../SkillSearch'

const CreateProjectModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    budget: Yup.number().min(1, 'Budget must be at least $1').required('Budget is required'),
    duration: Yup.string().required('Duration is required'),
    requiredSkills: Yup.array().min(1, 'At least one skill is required'),
  })

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      budget: '',
      duration: '',
      requiredSkills: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        await projectAPI.create(values)
        toast.success('Project created successfully')
        onSuccess()
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to create project')
      } finally {
        setLoading(false)
      }
    },
  })

  const handleAddSkill = (skill) => {
    if (!formik.values.requiredSkills.includes(skill)) {
      formik.setFieldValue('requiredSkills', [...formik.values.requiredSkills, skill])
    }
  }

  const handleRemoveSkill = (skill) => {
    formik.setFieldValue(
      'requiredSkills',
      formik.values.requiredSkills.filter(s => s !== skill)
    )
  }

  const handleAddCustomSkill = (customSkill) => {
    if (customSkill && customSkill.trim() && !formik.values.requiredSkills.includes(customSkill.trim())) {
      formik.setFieldValue('requiredSkills', [...formik.values.requiredSkills, customSkill.trim()])
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Create New Project</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formik.touched.title && formik.errors.title
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Build an E-commerce Website"
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formik.touched.description && formik.errors.description
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Describe your project in detail..."
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget ($) *
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formik.values.budget}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-md ${
                      formik.touched.budget && formik.errors.budget
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder="e.g., 1000"
                  />
                  {formik.touched.budget && formik.errors.budget && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.budget}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formik.values.duration}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-md ${
                      formik.touched.duration && formik.errors.duration
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder="e.g., 2 weeks, 1 month"
                  />
                  {formik.touched.duration && formik.errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.duration}</p>
                  )}
                </div>
              </div>

              {/* This is the CORRECT Skills section - keep ONLY this one */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills *
                </label>
                
                <SkillSearch
                  selectedSkills={formik.values.requiredSkills}
                  onAddSkill={handleAddSkill}
                  onRemoveSkill={handleRemoveSkill}
                  onAddCustomSkill={handleAddCustomSkill}
                  placeholder="Search for required skills (e.g., React, Node.js, UI Design)"
                  maxSuggestions={6}
                  allowCustomSkills={true}
                />
                
                {formik.touched.requiredSkills && formik.errors.requiredSkills && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.requiredSkills}</p>
                )}
              </div>
              {/* END of Skills section */}
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectModal