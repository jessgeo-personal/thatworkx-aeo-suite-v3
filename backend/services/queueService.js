const jobs = new Map();

export function createJob(jobId, totalQueued, initialPagesCompleted = 0, initialResults = []) {
  const job = {
    jobId,
    status: 'pending',
    totalQueued,
    pagesCompleted: initialPagesCompleted,
    results: initialResults
  };
  jobs.set(jobId, job);
  return job;
}

export function getJobStatus(jobId) {
  return jobs.get(jobId);
}

export function updateJobProgress(jobId, pagesCompleted, additionalResults = []) {
  const job = jobs.get(jobId);
  if (job) {
    job.pagesCompleted = pagesCompleted;
    job.results = job.results.concat(additionalResults);
    if (job.pagesCompleted >= job.totalQueued) {
      job.status = 'complete';
    } else {
      job.status = 'processing';
    }
  }
  return job;
}

export function failJob(jobId, errorMsg) {
  const job = jobs.get(jobId);
  if (job) {
    job.status = 'failed';
    job.error = errorMsg;
  }
  return job;
}

export { jobs };

export default {
  createJob,
  getJobStatus,
  updateJobProgress,
  failJob,
  jobs
};
