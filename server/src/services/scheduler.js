/**
 * 定时调度器
 * 基于 MCP 文档：node-cron 3.x
 * 示例：每 30 分钟执行 cron.schedule 任务
 */

const cron = require('node-cron');
const { collect } = require('./collector');
const { monitorKeywords } = require('./monitor');

let task = null;

/**
 * 启动定时采集任务
 */
function startScheduler(intervalMinutes) {
  const minutes = parseInt(intervalMinutes) || 30;

  // 构造 cron 表达式：每 N 分钟
  // node-cron 不支持 /N 语法用于所有情况，使用具体间隔
  let cronExpr;
  if (minutes === 1) {
    cronExpr = '* * * * *';
  } else if (minutes <= 59) {
    cronExpr = `*/${minutes} * * * *`;
  } else {
    const hours = Math.floor(minutes / 60);
    cronExpr = `0 */${hours} * * *`;
  }

  task = cron.schedule(cronExpr, async () => {
    console.log(`[Scheduler] 定时采集触发（间隔 ${minutes} 分钟）`);
    try {
      await collect();
      await monitorKeywords(minutes + 5);
    } catch (err) {
      console.error('[Scheduler] 任务执行错误:', err.message);
    }
  });

  console.log(`[Scheduler] 定时任务已启动，cron: ${cronExpr}`);
}

function stopScheduler() {
  if (task) {
    task.stop();
    task = null;
    console.log('[Scheduler] 定时任务已停止');
  }
}

module.exports = { startScheduler, stopScheduler };
