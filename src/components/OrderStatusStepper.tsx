import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  CreditCard, 
  FileCheck, 
  Clock, 
  Printer, 
  Scissors, 
  PackageCheck, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react-native';

const STEPS = [
  { key: 'MENUNGGU_PEMBAYARAN', title: 'Belum Bayar', desc: 'Selesaikan pembayaran', Icon: CreditCard },
  { key: 'MENUNGGU_VERIFIKASI', title: 'Verifikasi', desc: 'Admin cek bukti transfer', Icon: FileCheck },
  { key: 'ANTRIAN_PRODUKSI', title: 'Antrean Cetak', desc: 'Masuk list kerja operator', Icon: Clock },
  { key: 'SEDANG_DICETAK', title: 'Sedang Dicetak', desc: 'Proses mesin percetakan', Icon: Printer },
  { key: 'FINISHING', title: 'Finishing', desc: 'Pemotongan & laminasi', Icon: Scissors },
  { key: 'SIAP_DIAMBIL', title: 'Siap Diambil', desc: 'Siap diambil / dikirim', Icon: PackageCheck },
  { key: 'SELESAI', title: 'Selesai', desc: 'Pesanan tuntas diterima', Icon: CheckCircle2 },
];

const STATUS_ORDER_MAP: Record<string, number> = {
  MENUNGGU_PEMBAYARAN: 0,
  PENDING: 0,
  MENUNGGU_VERIFIKASI: 1,
  ANTRIAN_PRODUKSI: 2,
  CONFIRMED: 2,
  SEDANG_DICETAK: 3,
  PROCESSING: 3,
  FINISHING: 4,
  SIAP_DIAMBIL: 5,
  READY: 5,
  DIKIRIM: 5,
  SELESAI: 6,
  COMPLETED: 6,
};

interface Props {
  status: string;
}

export const OrderStatusStepper: React.FC<Props> = ({ status }) => {
  const isCancelled = status === 'DIBATALKAN' || status === 'CANCELLED';
  const isRejected = status === 'PEMBAYARAN_DITOLAK';

  if (isCancelled || isRejected) {
    return (
      <View style={[styles.container, styles.cancelledContainer]}>
        <XCircle size={28} color="#DC2626" />
        <View style={styles.cancelledTextContainer}>
          <Text style={styles.cancelledTitle}>
            {isRejected ? 'Bukti Pembayaran Ditolak' : 'Pesanan Dibatalkan'}
          </Text>
          <Text style={styles.cancelledDesc}>
            {isRejected 
              ? 'Silakan unggah ulang bukti transfer yang valid pada halaman pembayaran.' 
              : 'Pesanan ini tidak dapat diproses lebih lanjut.'}
          </Text>
        </View>
      </View>
    );
  }

  const currentIdx = STATUS_ORDER_MAP[status] ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Alur Pengerjaan Pesanan</Text>

      <View style={styles.stepsWrapper}>
        {STEPS.map((step, index) => {
          const isDone = index < currentIdx;
          const isCurrent = index === currentIdx;
          const isPending = index > currentIdx;
          const isLast = index === STEPS.length - 1;

          const StepIcon = step.Icon;

          let iconBg = '#F1F5F9'; // slate-100
          let iconColor = '#94A3B8'; // slate-400
          let textColor = '#64748B'; // slate-500
          let lineColor = '#E2E8F0'; // slate-200

          if (isDone) {
            iconBg = '#DBEAFE'; // blue-100
            iconColor = '#2563EB'; // blue-600
            textColor = '#1E293B'; // slate-800
            lineColor = '#2563EB'; // blue-600
          } else if (isCurrent) {
            iconBg = '#2563EB'; // blue-600
            iconColor = '#FFFFFF'; // white
            textColor = '#0F172A'; // slate-900
          }

          return (
            <View key={step.key} style={styles.stepRow}>
              {/* Left Column: Icon + Connecting Vertical Line */}
              <View style={styles.indicatorCol}>
                <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                  {isDone ? (
                    <CheckCircle2 size={18} color="#2563EB" />
                  ) : (
                    <StepIcon size={16} color={iconColor} />
                  )}
                </View>

                {!isLast && (
                  <View 
                    style={[
                      styles.verticalLine, 
                      { backgroundColor: isDone ? '#2563EB' : '#E2E8F0' }
                    ]} 
                  />
                )}
              </View>

              {/* Right Column: Title + Description */}
              <View style={styles.textCol}>
                <View style={styles.titleRow}>
                  <Text style={[styles.stepTitle, { color: textColor, fontWeight: isCurrent ? '700' : '600' }]}>
                    {step.title}
                  </Text>
                  {isCurrent && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Status Saat Ini</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  stepsWrapper: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 36,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  verticalLine: {
    width: 2.5,
    flex: 1,
    marginVertical: -2,
    zIndex: 1,
  },
  textCol: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepTitle: {
    fontSize: 13,
  },
  stepDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
  },
  cancelledContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelledTextContainer: {
    flex: 1,
  },
  cancelledTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
  },
  cancelledDesc: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 2,
  },
});
