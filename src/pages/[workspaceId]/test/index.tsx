import React from 'react'
import { api } from '~/utils/api'
import { LoadingHero } from '~/layouts/LoadingHero'

const Testing = () => {
  const providerDocumentId = "5c4c13b4-1474-4744-ab57-2557cf48668f"
  const { data, isLoading } = api.workspace.issue.generateIssueRecommendations.useQuery({ providerDocumentId }, {
    refetchOnWindowFocus: false
  });
  
  if (!isLoading) {
    console.log("\n RESULT \n\n", data);
  }

  return (
    <div>
      {isLoading ? (
        <LoadingHero />
      )
      : (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        <div>
          <h1>Result</h1>
          {data && JSON.stringify(data)}
        </div>
        )}
    </div>
  )
}

export default Testing