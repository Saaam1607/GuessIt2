import Constants from 'expo-constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Clipboard,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  Layout,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';

import { LobbyCard } from '@/components/lobby-card';
import { OptionButton } from '@/components/option-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyledButton, StyledInput } from '@/components/ui-components';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { OPTION_LABELS, TRUE_FALSE_LABELS } from '@/constants/game';
import { useTheme } from '@/hooks/use-theme';
import type { GameEndPayload, LobbyPlayer, QuestionPayload, RoundResult } from '@/types/game';

import { QuestionImage } from '@/components/ui/questionImage';

import CategoryReveal from '@/components/question/category-reveal';
import Ranking from '@/components/results/ranking';

type ScreenState = 'MENU' | 'LOBBY' | 'GAME_CONNECTING' | 'GAME_CATEGORY_REVEAL' | 'GAME_QUESTION' | 'GAME_ROUND_RESULT' | 'GAME_END';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function App() {
  const theme = useTheme();

  // ── Screen state ─────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<ScreenState>('MENU');

  // ── Lobby state ──────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [lobbyCodeInput, setLobbyCodeInput] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [showJoinInput, setShowJoinInput] = useState(false);

  // ── Connection ───────────────────────────────────────────────────────────────
  const [connected, setConnected] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  // ── Validation ───────────────────────────────────────────────────────────────
  const [usernameError, setUsernameError] = useState('');
  const [codeError, setCodeError] = useState('');

  // ── Game state ───────────────────────────────────────────────────────────────
  const [currentQuestion, setCurrentQuestion] = useState<QuestionPayload | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [gameEnd, setGameEnd] = useState<GameEndPayload | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [readyCount, setReadyCount] = useState<{ ready: number; total: number } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasPressedReady, setHasPressedReady] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // ── Socket ───────────────────────────────────────────────────────────────────
  const socketRef = useRef<any>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getSocketUrl = (): string => {
    let ip = 'localhost';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') ip = window.location.hostname;
    } else {
      const hostUri = Constants.expoConfig?.hostUri;
      if (hostUri) {
        const extractedIp = hostUri.split(':')[0];
        if (extractedIp) ip = extractedIp;
      } else if (Platform.OS === 'android') {
        ip = '10.0.2.2';
      }
    }
    return `http://${ip}:3000`;
  };

  useEffect(() => {
    const url = getSocketUrl();
    setServerUrl(url);
    console.log('[Socket] Connecting to server at:', url);

    const socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('[Socket] Connected! ID:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('[Socket] Disconnected');
    });

    socket.on('connect_error', (error) => {
      setConnected(false);
      console.warn('[Socket] Connection error:', error.message);
    });

    // Lobby events
    socket.on('lobbyState', (state: { code: string; players: LobbyPlayer[] }) => {
      setPlayers(state.players);
      setLobbyCode(state.code);
      setScreen('LOBBY');
      setCodeError('');
      const me = state.players.find((p) => p.id === socket.id);
      if (me) setIsHost(me.isHost);
    });

    socket.on('joinError', (errorMsg: string) => {
      console.warn('[Socket] Join/Create error:', errorMsg);
      setCodeError(errorMsg);
    });

    // Game events — all handled on the SAME socket
    socket.on('gameStarted', () => {
      console.log('[Socket] Game started! Transitioning to game screen.');
      setScreen('GAME_CONNECTING');
      // Reset game state
      setCurrentQuestion(null);
      setSelectedIndex(null);
      setRoundResult(null);
      setGameEnd(null);
      setAnswerSubmitted(false);
      setReadyCount(null);
      setCountdown(null);
      setHasPressedReady(false);
    });

    socket.on('newQuestion', (payload: QuestionPayload) => {
      console.log('[Socket] newQuestion received:', payload.index + 1, '/', payload.total);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      setCurrentQuestion(payload);
      setSelectedIndex(null);
      setAnswerSubmitted(false);
      setRoundResult(null);
      setReadyCount(null);
      setCountdown(null);
      setHasPressedReady(false);
      setScreen('GAME_CATEGORY_REVEAL');
      revealTimerRef.current = setTimeout(() => {
        revealTimerRef.current = null;
        setScreen('GAME_QUESTION');
      }, 3000);
    });

    socket.on('roundResult', (result: RoundResult) => {
      console.log('[Socket] roundResult received');
      setRoundResult(result);
      setReadyCount(null);
      setCountdown(null);
      setHasPressedReady(false);
      setScreen('GAME_ROUND_RESULT');
    });

    socket.on('readyCount', (data: { ready: number; total: number }) => {
      setReadyCount(data);
    });

    socket.on('gameEnd', (payload: GameEndPayload) => {
      console.log('[Socket] gameEnd received');
      setGameEnd(payload);
      setScreen('GAME_END');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Lobby Actions ────────────────────────────────────────────────────────────

  const handleCreateLobby = () => {
    if (username.trim().length < 3) {
      setUsernameError('Il nome deve avere almeno 3 caratteri');
      return;
    }
    setUsernameError('');
    if (!connected) {
      alert('Non sei connesso al server del gioco. Verifica che il server sia attivo.');
      return;
    }
    console.log('[Socket] Emitting createLobby:', username.trim());
    socketRef.current?.emit('createLobby', { username: username.trim() });
  };

  const handleJoinLobbyClick = () => {
    if (username.trim().length < 3) {
      setUsernameError('Il nome deve avere almeno 3 caratteri');
      return;
    }
    setUsernameError('');
    setShowJoinInput(true);
  };

  const handleConfirmJoin = () => {
    if (lobbyCodeInput.trim().length !== 4) {
      setCodeError('Il codice deve essere di 4 caratteri');
      return;
    }
    setCodeError('');
    if (!connected) {
      alert('Non sei connesso al server del gioco. Verifica che il server sia attivo.');
      return;
    }
    const code = lobbyCodeInput.trim().toUpperCase();
    console.log(`[Socket] Emitting joinLobby for code ${code}:`, username.trim());
    socketRef.current?.emit('joinLobby', { username: username.trim(), code });
  };

  const handleLeaveLobby = () => {
    socketRef.current?.emit('leaveLobby');
    setScreen('MENU');
    setLobbyCode('');
    setLobbyCodeInput('');
    setIsHost(false);
    setPlayers([]);
    setShowJoinInput(false);
  };

  const toggleReady = () => {
    socketRef.current?.emit('toggleReady');
  };

  const handleStartGame = () => {
    console.log('[Socket] Emitting startGame');
    socketRef.current?.emit('startGame');
  };

  const handleShareCode = async () => {
    try {
      const message = `Entra nel mio quiz multiplayer su GuessIt! Codice Lobby: ${lobbyCode}`;
      if (Platform.OS === 'web') {
        Clipboard.setString(lobbyCode);
        alert('Codice copiato negli appunti!');
      } else {
        await Share.share({ message, title: 'Condividi Codice Lobby' });
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  // ── Game Actions ─────────────────────────────────────────────────────────────

  const handleSelectOption = useCallback(
    (index: number) => {
      if (answerSubmitted) return;
      setSelectedIndex(index);
    },
    [answerSubmitted],
  );

  const handleSubmitAnswer = useCallback(() => {
    if (selectedIndex === null || answerSubmitted) return;
    setAnswerSubmitted(true);
    socketRef.current?.emit('submitAnswer', { answerIndex: selectedIndex });
  }, [selectedIndex, answerSubmitted]);

  const handleReadyForNext = useCallback(() => {
    if (hasPressedReady) return;
    setHasPressedReady(true);
    socketRef.current?.emit('readyForNext');
  }, [hasPressedReady]);

  const handleBackToMenu = () => {
    socketRef.current?.emit('leaveLobby');
    setScreen('MENU');
    setLobbyCode('');
    setLobbyCodeInput('');
    setIsHost(false);
    setPlayers([]);
    setCurrentQuestion(null);
    setSelectedIndex(null);
    setRoundResult(null);
    setGameEnd(null);
  };

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const myId = socketRef.current?.id ?? '';

  function getOptionLabels(type: 'multiple_choice' | 'true_false' | undefined): string[] {
    return type === 'true_false' ? TRUE_FALSE_LABELS : OPTION_LABELS;
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const isGameScreen =
    screen === 'GAME_CONNECTING' ||
    screen === 'GAME_CATEGORY_REVEAL' ||
    screen === 'GAME_QUESTION' ||
    screen === 'GAME_ROUND_RESULT' ||
    screen === 'GAME_END';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Connection Status Pill — hidden during game */}
            {!isGameScreen && (
              <Animated.View entering={FadeIn.duration(400)} style={styles.connectionBadgeContainer}>
                <View style={[styles.connectionDot, { backgroundColor: connected ? '#10b981' : '#ef4444' }]} />
                <ThemedText type="code" style={styles.connectionText}>
                  {connected ? `Connesso: ${serverUrl}` : 'Disconnesso (Riprovo...)'}
                </ThemedText>
              </Animated.View>
            )}

            {/* Header / Brand */}
            <Animated.View entering={FadeInUp.duration(600).delay(100)} style={styles.header}>
              <ThemedText type="title" style={styles.logoText}>
                Guess<ThemedText type="title" style={styles.logoAccent}>It!</ThemedText>
              </ThemedText>
              {!isGameScreen && (
                <ThemedText type="small" style={styles.subtitle}>
                  Sfida i tuoi amici in tempo reale
                </ThemedText>
              )}
            </Animated.View>

            {/* ── MENU ── */}
            {screen === 'MENU' && (
              <Animated.View
                entering={FadeInDown.duration(500)}
                exiting={FadeOut.duration(300)}
                style={styles.cardContainer}
              >
                <LobbyCard>
                  <ThemedText type="subtitle" style={styles.cardTitle}>Benvenuto</ThemedText>

                  <StyledInput
                    label="Il tuo Nickname"
                    placeholder="Inserisci il tuo nome..."
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      if (text.trim().length >= 3) setUsernameError('');
                    }}
                    error={usernameError}
                    maxLength={15}
                  />

                  {!showJoinInput ? (
                    <View style={styles.buttonGroup}>
                      <StyledButton title="Crea Lobby" variant="primary" onPress={handleCreateLobby} disabled={!connected} />
                      <StyledButton title="Partecipa a Lobby" variant="secondary" onPress={handleJoinLobbyClick} disabled={!connected} />
                    </View>
                  ) : (
                    <Animated.View entering={FadeIn.duration(300)} style={styles.joinForm}>
                      <StyledInput
                        label="Codice Lobby"
                        placeholder="Es. AB3D"
                        value={lobbyCodeInput}
                        onChangeText={(text) => {
                          setLobbyCodeInput(text.toUpperCase());
                          if (text.trim().length === 4) setCodeError('');
                        }}
                        error={codeError}
                        maxLength={4}
                        autoCapitalize="characters"
                      />
                      <View style={styles.buttonRow}>
                        <StyledButton
                          title="Annulla"
                          variant="secondary"
                          style={{ flex: 1, marginRight: Spacing.two }}
                          onPress={() => setShowJoinInput(false)}
                        />
                        <StyledButton
                          title="Entra"
                          variant="primary"
                          style={{ flex: 1 }}
                          onPress={handleConfirmJoin}
                        />
                      </View>
                    </Animated.View>
                  )}
                </LobbyCard>
              </Animated.View>
            )}

            {/* ── LOBBY ── */}
            {screen === 'LOBBY' && (
              <Animated.View
                entering={FadeInDown.duration(500)}
                exiting={FadeOut.duration(300)}
                layout={Layout.springify()}
                style={styles.cardContainer}
              >
                <LobbyCard>
                  {/* Lobby Header */}
                  <View style={styles.lobbyHeader}>
                    <View>
                      <ThemedText type="small" style={styles.lobbyLabel}>CODICE LOBBY</ThemedText>
                      <ThemedText type="subtitle" style={styles.codeText}>{lobbyCode}</ThemedText>
                    </View>
                    <StyledButton title="Condividi" variant="secondary" style={styles.shareButton} onPress={handleShareCode} />
                  </View>

                  <View style={styles.separator} />

                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    Giocatori ({players.length}/4)
                  </ThemedText>

                  <View style={styles.playerList}>
                    {players.map((player) => (
                      <Animated.View
                        key={player.id}
                        entering={FadeIn.duration(400)}
                        layout={Layout.springify()}
                        style={[
                          styles.playerRow,
                          player.id === socketRef.current?.id && styles.myPlayerRow,
                        ]}
                      >
                        <View style={styles.playerInfo}>
                          <ThemedText type="default" style={styles.playerName}>{player.name}</ThemedText>
                          {player.isHost && (
                            <View style={styles.hostBadge}>
                              <Text style={styles.hostBadgeText}>HOST</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.statusIndicator}>
                          <View style={[styles.statusDot, { backgroundColor: player.isReady ? '#10b981' : '#f59e0b' }]} />
                          <ThemedText type="small" style={styles.statusText}>
                            {player.isReady ? 'Pronto' : 'In attesa'}
                          </ThemedText>
                        </View>
                      </Animated.View>
                    ))}
                  </View>

                  <View style={styles.separator} />

                  <View style={styles.lobbyActions}>
                    {isHost ? (
                      <StyledButton
                        title="Avvia Partita"
                        variant="primary"
                        disabled={players.length < 2 || players.some((p) => !p.isReady)}
                        onPress={handleStartGame}
                      />
                    ) : (
                      <StyledButton
                        title={players.find((p) => p.id === socketRef.current?.id)?.isReady ? 'Annulla Pronto' : 'Pronto'}
                        variant={players.find((p) => p.id === socketRef.current?.id)?.isReady ? 'secondary' : 'primary'}
                        onPress={toggleReady}
                      />
                    )}
                    <StyledButton title="Abbandona Lobby" variant="danger" onPress={handleLeaveLobby} />
                  </View>
                </LobbyCard>
              </Animated.View>
            )}

            {/* ── GAME: CONNECTING ── */}
            {screen === 'GAME_CONNECTING' && (
              <Animated.View entering={FadeIn} style={gs.centered}>
                <Text style={gs.bigEmoji}>🎮</Text>
                <Text style={[gs.heading, { color: theme.text }]}>La partita sta iniziando!</Text>
                <Text style={[gs.sub, { color: theme.textSecondary }]}>Attendi la prima domanda…</Text>
              </Animated.View>
            )}

            {/* ── GAME: CATEGORY REVEAL ── */}
            {screen === 'GAME_CATEGORY_REVEAL' && currentQuestion && (
              <CategoryReveal
                category={currentQuestion.category}
                imageName={currentQuestion.image}
                index={currentQuestion.index}
                total={currentQuestion.total}
                theme={theme}
                gs={gs}
              />
            )}

            {/* ── GAME: QUESTION ── */}
            {screen === 'GAME_QUESTION' && currentQuestion && (
              <Animated.View entering={FadeInUp.duration(400)} exiting={FadeOut.duration(200)}>
                <View style={gs.questionHeader}>
                  <View style={[gs.categoryPill, { backgroundColor: 'rgba(99,102,241,0.10)' }]}>
                    <Text style={[gs.categoryText, { color: '#6366f1' }]}>{currentQuestion.category}</Text>
                  </View>
                  <Text style={[gs.progressText, { color: theme.textSecondary }]}>
                    {currentQuestion.index + 1} / {currentQuestion.total}
                  </Text>
                </View>
                
                <QuestionImage imageName={currentQuestion.image} />

                <Text style={[gs.questionText, { color: theme.text }]}>{currentQuestion.question}</Text>

                <View style={gs.optionsContainer}>
                  {currentQuestion.options.map((opt, idx) => {
                    const labels = getOptionLabels(currentQuestion.type);
                    return <OptionButton
                        key={idx}
                        label={labels[idx] ?? ''}
                        text={opt}
                        index={idx}
                        selectedIndex={selectedIndex}
                        correctIndex={null}
                        onPress={handleSelectOption}
                        disabled={answerSubmitted}
                        questionType={currentQuestion.type}
                      />;
                  })}
                </View>

                {answerSubmitted ? (
                  <Animated.View entering={FadeIn.duration(300)} style={gs.waitingRow}>
                    <Text style={[gs.waitingText, { color: theme.textSecondary }]}>
                      ⏳ Risposta inviata! Aspettando gli altri…
                    </Text>
                  </Animated.View>
                ) : (
                  <Animated.View entering={FadeIn.duration(300)} style={gs.submitRow}>
                    <StyledButton title="Invia" variant="primary" onPress={handleSubmitAnswer} disabled={selectedIndex === null} />
                  </Animated.View>
                )}
              </Animated.View>
            )}

            {/* ── GAME: ROUND RESULT ── */}
            {screen === 'GAME_ROUND_RESULT' && currentQuestion && roundResult && (
              <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut.duration(200)}>
                
                <View style={gs.roundResultHeader}>
                  <Text style={[gs.heading, { color: theme.text, textAlign: 'center' }]}>
                    Risultato Round
                  </Text>
                  {currentQuestion.explaination?.length > 0 && (
                    <Pressable style={gs.infoButton} onPress={() => setShowInfo(true)}>
                      <Text style={gs.infoButtonText}>?</Text>
                    </Pressable>
                  )}
                </View>

                <QuestionImage imageName={currentQuestion.image} />

                <View style={gs.optionsContainer}>
                  {currentQuestion.options.map((opt, idx) => {
                    const labels = getOptionLabels(currentQuestion.type);
                    return <OptionButton
                        key={idx}
                        label={labels[idx] ?? ''}
                        text={opt}
                        index={idx}
                        selectedIndex={selectedIndex}
                        correctIndex={roundResult.correctIndex}
                        onPress={() => { }}
                        disabled={true}
                        questionType={currentQuestion.type}
                      />;
                  })}
                </View>

                <Ranking
                  players={roundResult.players}
                  myId={myId}
                  gs={gs}
                  theme={theme}
                  answers={roundResult.answers}
                  correctIndex={roundResult.correctIndex}
                  questionType={currentQuestion.type}
                />

                {hasPressedReady ? (
                  <Text style={[gs.readyWaitingText, { color: theme.textSecondary }]}>
                    {readyCount ? `In attesa degli altri… (${readyCount.ready}/${readyCount.total})` : 'In attesa degli altri…'}
                  </Text>
                ) : (
                  <View style={gs.readyButtonContainer}>
                    {readyCount && (
                      <Text style={[gs.readyInfoText, { color: theme.textSecondary }]}>
                        {readyCount.ready}/{readyCount.total} pronti
                      </Text>
                    )}
                    <StyledButton title="Pronto" variant="primary" onPress={handleReadyForNext} />
                  </View>
                )}
              </Animated.View>
            )}

            {/* ── GAME: END ── */}
            {/* {screen === 'GAME_END' && gameEnd && (
              <Animated.View entering={FadeIn.duration(500)} style={gs.centered}>
                <Animated.Text entering={ZoomIn.delay(100)} style={gs.bigEmoji}>
                  {gameEnd.players[0]?.id === myId ? '🏆' : '🎉'}
                </Animated.Text>
                <Text style={[gs.heading, { color: theme.text }]}>
                  {gameEnd.players[0]?.id === myId ? 'Hai vinto!' : `Ha vinto ${gameEnd.players[0]?.name ?? '?'}`}
                </Text>
                <Text style={[gs.sub, { color: theme.textSecondary, marginBottom: Spacing.four }]}>
                  Classifica finale
                </Text>
                {gameEnd.players.map((p, i) => (
                  <ScoreRow key={p.id} player={p} rank={i} myId={myId} />
                ))}
                <Pressable style={gs.backButton} onPress={handleBackToMenu}>
                  <Text style={gs.backButtonText}>Torna al Menu</Text>
                </Pressable>
              </Animated.View>
            )} */}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={showInfo} transparent animationType="fade" onRequestClose={() => setShowInfo(false)}>
        <Pressable style={gs.modalOverlay} onPress={() => setShowInfo(false)}>
          <Pressable style={[gs.modalContent, { backgroundColor: theme.background }]} onPress={() => {}}>
            <Text style={[gs.modalTitle, { color: theme.text }]}>Spiegazione</Text>
            <ScrollView style={gs.modalScroll}>
              {currentQuestion?.explaination?.map((line, i) => (
                <Text key={i} style={[gs.modalText, { color: theme.text }]}>{line}</Text>
              ))}
            </ScrollView>
            <Pressable style={gs.modalCloseButton} onPress={() => setShowInfo(false)}>
              <Text style={gs.modalCloseText}>Chiudi</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

// ─── Lobby Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    justifyContent: 'center',
  },
  connectionBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  connectionDot: { width: 8, height: 8, borderRadius: 4 },
  connectionText: { fontSize: 11, fontWeight: '700' },
  header: { alignItems: 'center', marginBottom: Spacing.five },
  logoText: { fontSize: 52, fontWeight: '900', letterSpacing: -1 },
  logoAccent: { color: '#4f46e5', fontWeight: '900' },
  subtitle: { marginTop: Spacing.half, opacity: 0.8 },
  cardContainer: { width: '100%' },
  cardTitle: { marginBottom: Spacing.three, textAlign: 'center' },
  buttonGroup: { marginTop: Spacing.three, width: '100%' },
  joinForm: { marginTop: Spacing.two, width: '100%' },
  buttonRow: { flexDirection: 'row', marginTop: Spacing.two },
  lobbyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  lobbyLabel: { fontSize: 12, fontWeight: '700', opacity: 0.6 },
  codeText: { fontSize: 36, fontWeight: '800', color: '#4f46e5', letterSpacing: 2 },
  shareButton: { height: 40, width: 120, marginVertical: 0 },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: Spacing.three,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  playerList: { gap: Spacing.two },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  myPlayerRow: {
    borderColor: 'rgba(79, 70, 229, 0.3)',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  playerInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  playerName: { fontWeight: '600' },
  hostBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: Spacing.one + Spacing.half,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  hostBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one + Spacing.half },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },
  lobbyActions: { gap: Spacing.one },
});

// ─── Game Styles ──────────────────────────────────────────────────────────────

const gs = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.six,
    gap: Spacing.two,
  },
  bigEmoji: { fontSize: 72, textAlign: 'center' },
  heading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  categoryPill: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.one, borderRadius: 999 },
  categoryText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  progressText: { fontSize: 13, fontWeight: '600' },
  revealContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.six,
    gap: Spacing.four,
  },
  revealPill: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: 999,
  },
  revealCategory: {
    fontSize: 28,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  revealImage: {
    width: '100%',
    height: 250,
    borderRadius: Spacing.three,
  },
  revealProgress: {
    fontSize: 16,
    fontWeight: '700',
  },
  questionImage: {
    width: '100%',
    height: 180,
    borderRadius: Spacing.two,
    marginBottom: Spacing.three,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: Spacing.four,
    letterSpacing: -0.2,
  },
  optionsContainer: { marginBottom: Spacing.two },
  waitingRow: { alignItems: 'center', padding: Spacing.two },
  waitingText: { fontSize: 13, fontWeight: '500' },
  submitRow: { alignItems: 'center', paddingVertical: Spacing.two },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
  },
  roundResultHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  modalScroll: { maxHeight: 300 },
  modalText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: Spacing.two,
  },
  modalCloseButton: {
    marginTop: Spacing.three,
    backgroundColor: '#6366f1',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  modalCloseText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backButton: {
    marginTop: Spacing.four,
    backgroundColor: '#6366f1',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.two + 2,
    alignSelf: 'center',
  },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
    paddingVertical: Spacing.three,
  },
  countdownText: {
    fontSize: 64,
    fontWeight: '900',
    textAlign: 'center',
  },
  readyButtonContainer: {
    alignItems: 'center',
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  readyInfoText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  readyWaitingText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.four,
  }
});
