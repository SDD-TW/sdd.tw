/**
 * 整合測試腳本
 * 用於測試 Event API 和 Discord API 連接
 */

import 'dotenv/config';
import {
  generateTeamId,
  calculateEvaluationDate,
  createTeamCreatedEvent,
  createAllMemberJoinedEvents,
  type TeamMemberData,
} from '../src/lib/eventApi';
import { sendTeamCreatedNotification } from '../src/lib/discordApi';

// 測試資料
const testCaptain: TeamMemberData = {
  githubId: 'coomysky',
  discordId: '354265089685323787',
  discordName: 'Coomy',
  email: 'coomy@example.com',
};

const testMember2: TeamMemberData = {
  githubId: 'member2',
  discordId: '777888999000111222',
  discordName: 'Member2',
  email: 'member2@example.com',
};

async function testEventApi() {
  console.log('\n========================================');
  console.log('🧪 測試 1: Event API 連接');
  console.log('========================================\n');

  try {
    // 產生 Team ID
    const teamId = generateTeamId(testCaptain.githubId);
    console.log('✅ Team ID 產生成功:', teamId);

    // 計算評鑑日期
    const evaluationDate = calculateEvaluationDate();
    console.log('✅ 評鑑日期計算成功:', evaluationDate);

    // 測試 TEAM_CREATED 事件
    console.log('\n📝 測試 TEAM_CREATED 事件...');
    const teamCreatedResult = await createTeamCreatedEvent(
      teamId,
      '測試隊伍',
      testCaptain
    );

    if (teamCreatedResult && teamCreatedResult.success) {
      console.log('✅ TEAM_CREATED 事件寫入成功!');
      console.log('   Event ID:', teamCreatedResult.event_id);
      console.log('   Time:', teamCreatedResult.time);
    } else {
      console.error('❌ TEAM_CREATED 事件寫入失敗!');
      if (teamCreatedResult && !teamCreatedResult.success) {
        console.error('   Error:', teamCreatedResult.error);
        console.error('   Message:', teamCreatedResult.message);
      }
      throw new Error('TEAM_CREATED 事件寫入失敗');
    }

    // 測試 TEAM_MEMBER_JOINED 事件（批次）
    console.log('\n📝 測試 TEAM_MEMBER_JOINED 事件...');
    const allMembers = [testCaptain, testMember2];
    const memberJoinedResults = await createAllMemberJoinedEvents(
      teamId,
      '測試隊伍',
      allMembers
    );

    console.log(`✅ 批次寫入完成: ${memberJoinedResults.success}/${memberJoinedResults.total} 成功`);
    
    if (memberJoinedResults.failed > 0) {
      console.warn(`⚠️  有 ${memberJoinedResults.failed} 筆失敗`);
    }

    console.log('\n✅ Event API 測試通過!\n');
    return true;
  } catch (error: any) {
    console.error('\n❌ Event API 測試失敗!');
    console.error('   錯誤:', error.message);
    return false;
  }
}

async function testDiscordApi() {
  console.log('\n========================================');
  console.log('🧪 測試 2: Discord API 連接');
  console.log('========================================\n');

  try {
    const evaluationDate = calculateEvaluationDate();
    
    console.log('📢 測試 Discord 通知...');
    const discordSuccess = await sendTeamCreatedNotification({
      teamName: '測試隊伍',
      captainDiscordId: testCaptain.discordId,
      memberDiscordIds: [testCaptain.discordId, testMember2.discordId],
      evaluationDate,
    });

    if (discordSuccess) {
      console.log('✅ Discord 通知發送成功!');
      console.log('   請檢查 Discord 頻道是否收到訊息');
    } else {
      console.error('❌ Discord 通知發送失敗!');
      throw new Error('Discord 通知發送失敗');
    }

    console.log('\n✅ Discord API 測試通過!\n');
    return true;
  } catch (error: any) {
    console.error('\n❌ Discord API 測試失敗!');
    console.error('   錯誤:', error.message);
    return false;
  }
}

async function testCompleteFlow() {
  console.log('\n========================================');
  console.log('🧪 測試 3: 完整流程測試');
  console.log('========================================\n');

  try {
    const teamId = generateTeamId(testCaptain.githubId);
    const evaluationDate = calculateEvaluationDate();

    console.log('📝 Step 1: 寫入 TEAM_CREATED 事件...');
    const teamCreatedResult = await createTeamCreatedEvent(
      teamId,
      '完整測試隊伍',
      testCaptain
    );

    if (!teamCreatedResult || !teamCreatedResult.success) {
      throw new Error('TEAM_CREATED 事件寫入失敗');
    }
    console.log('   ✅ TEAM_CREATED 成功');

    console.log('\n📝 Step 2: 批次寫入 TEAM_MEMBER_JOINED 事件...');
    const allMembers = [testCaptain, testMember2];
    const memberJoinedResults = await createAllMemberJoinedEvents(
      teamId,
      '完整測試隊伍',
      allMembers
    );

    if (memberJoinedResults.failed > 0) {
      throw new Error(`${memberJoinedResults.failed} 筆 TEAM_MEMBER_JOINED 事件寫入失敗`);
    }
    console.log('   ✅ TEAM_MEMBER_JOINED 成功');

    console.log('\n📢 Step 3: 發送 Discord 通知...');
    const discordSuccess = await sendTeamCreatedNotification({
      teamName: '完整測試隊伍',
      captainDiscordId: testCaptain.discordId,
      memberDiscordIds: [testCaptain.discordId, testMember2.discordId],
      evaluationDate,
    });

    if (!discordSuccess) {
      throw new Error('Discord 通知發送失敗');
    }
    console.log('   ✅ Discord 通知成功');

    console.log('\n✅ 完整流程測試通過!\n');
    return true;
  } catch (error: any) {
    console.error('\n❌ 完整流程測試失敗!');
    console.error('   錯誤:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   組隊功能整合測試                      ║');
  console.log('╚════════════════════════════════════════╝');

  const results = {
    eventApi: false,
    discordApi: false,
    completeFlow: false,
  };

  // 測試 1: Event API
  results.eventApi = await testEventApi();
  
  // 等待 1 秒避免 API rate limit
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 測試 2: Discord API
  results.discordApi = await testDiscordApi();
  
  // 等待 1 秒避免 API rate limit
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 測試 3: 完整流程
  results.completeFlow = await testCompleteFlow();

  // 總結
  console.log('\n========================================');
  console.log('📊 測試結果總結');
  console.log('========================================\n');
  console.log(`Event API 測試:       ${results.eventApi ? '✅ 通過' : '❌ 失敗'}`);
  console.log(`Discord API 測試:     ${results.discordApi ? '✅ 通過' : '❌ 失敗'}`);
  console.log(`完整流程測試:         ${results.completeFlow ? '✅ 通過' : '❌ 失敗'}`);

  const allPassed = results.eventApi && results.discordApi && results.completeFlow;
  console.log('\n' + (allPassed ? '🎉 所有測試通過！' : '⚠️  部分測試失敗，請檢查錯誤訊息'));
  console.log('\n');

  process.exit(allPassed ? 0 : 1);
}

// 執行測試
runAllTests().catch((error) => {
  console.error('\n💥 測試執行異常:', error);
  process.exit(1);
});

