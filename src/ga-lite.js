import galiteCommands from './ga-lite-commands'
import { getTracker } from './tracker-store'
import Tracker, { DEFAULT_TRACKER_NAME } from './tracker'
import getTasksInCommandQueue from './get-tasks-in-command-queue'
import './simple-polyfill-array-from'

export default function galite(command, ...values) {
  const [trackerName, trackerCommand] = splitTrackerCommand(command)

  const commandFoundInGlobalCommands = !!galiteCommands[command]
  const commandFoundInTrackerMethods =
    !!Tracker.prototype[trackerCommand] && trackerCommand !== 'constructor'

  if (commandFoundInGlobalCommands) {
    galiteCommands[command](...values)
  } else if (commandFoundInTrackerMethods) {
    const tracker = getTracker(trackerName)
    if (tracker) tracker[trackerCommand](...values)
  } else if (typeof command === 'function') {
    const tracker = getTracker(trackerName)
    command(tracker)
  } else {
    throw new Error(`Command ${command} is not available in ga-lite`)
  }
}

function splitTrackerCommand(command) {
  if (typeof command === 'string' && command.indexOf('.') > -1) {
    return command.split('.')
  } else {
    return [DEFAULT_TRACKER_NAME, command]
  }
}

Object.keys(galiteCommands).forEach(key => {
  galite[key] = galiteCommands[key]
})

getTasksInCommandQueue().forEach(args => galite(...args))
