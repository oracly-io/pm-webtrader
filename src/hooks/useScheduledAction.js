import { useEffect } from 'react'
import { ActionScheduler } from '@oracly/pm-libs/action-scheduler'

export const useScheduledQuery = (collector, dependency) => {
  useEffect(() => {

    ActionScheduler.query.addCollector(collector)
    ActionScheduler.query.dispatchNow(collector)

    return () => ActionScheduler.query.removeCollector(collector)

  }, dependency)
}

export const useScheduledCommand = (collector, dependency) => {
  useEffect(() => {

    ActionScheduler.command.addCollector(collector)
    ActionScheduler.command.dispatchNow(collector)

    return () => ActionScheduler.command.removeCollector(collector)

  }, dependency)
}
