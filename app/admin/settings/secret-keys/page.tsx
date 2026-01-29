import { getAllSecretKeys } from "./actions"
import SecretKeysTable from "./SecretKeysTable"
import CreateSecretKeyDialog from "./CreateSecretKeyDialog"

export default async function SecretKeysPage() {
  const secretKeys = await getAllSecretKeys()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">API Secret Keys</h1>
          <p className="text-gray-600 mt-1">
            Manage API secret keys for external applications and integrations.
          </p>
        </div>
        <CreateSecretKeyDialog />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Security Notice
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Keep your secret keys secure and never share them publicly. 
                Secret keys provide full access to your booking API and should be treated as passwords.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <SecretKeysTable secretKeys={secretKeys} />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              API Usage
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Include your secret key in API requests using one of these methods:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Header: <code className="bg-blue-100 px-1 rounded">x-secret-key: sk_your_key_here</code></li>
                <li>Header: <code className="bg-blue-100 px-1 rounded">Authorization: Bearer sk_your_key_here</code></li>
                <li>Query: <code className="bg-blue-100 px-1 rounded">?secret_key=sk_your_key_here</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
