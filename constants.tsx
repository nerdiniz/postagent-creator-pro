
import { VideoFile, Channel, HistoryItem } from './types';

export const MOCK_VIDEOS: VideoFile[] = [
  {
    id: '1',
    name: 'Morning_Vlog_01_final.mp4',
    size: '248 MB',
    resolution: '1080p',
    status: 'Draft',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9A0fpQR8dEEQfTzt0ndEP_CaIeoC2XcH2SwwyI5RbOdr3Udzqx2vVHSF49KdqhHRwkbfdm_TxFsUt7IU-it45-htt8MrWDGrof7GVYyv4ZuBpiY4lpaH3ofPMtt-eAQe_GTXSCgV3Be6KZjFSQh8y4UsN8qa2_4D0SCMx_tDRHQBgcXjyfq9rZmnyJUy69P_ZWoiMqkDXKwlLTmvnR8F48cxFAg1BZXmTXxFo3bOnXyqW7R6FhkqrMr850_zk4ErbvsTdpfnpa4wV'
  },
  {
    id: '2',
    name: 'Product_Review_Pro_v2.mp4',
    size: '1.2 GB',
    resolution: '4K',
    status: 'Scheduled',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB5Gg7w6RKZUwajudwRjRoWMwIgKR83ZREYnUSVtB3F4S4HwVWcilC5BKrVh0r4Wf673E_L5bOWLiWzrS2UBOsLg05u6jLlcyDBceVBfnsjHBXE-iLj50l9qyZA8xqtRwrmHx0acUN4xSqMrO1CoTOMeIG4i24GjzUFPNtpi9JCNjddcP_ni-5mh9s2gyfRHuW3RghOw8xFvx2Kno6xfMW0OVlWdkIDmxOBASwq3Zen0dhtkP4jqXbR6le_kUql1C9MccEspX9VJ01'
  },
  {
    id: '3',
    name: 'Gaming_Highlights_Ep12.mov',
    size: '890 MB',
    resolution: '1080p',
    status: 'Draft',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA1tWlQIAZynVPlc91rrL8bzpqTTTsnsy3cgG6uRsDKODFcz7k8w6fnLDqThwy-tkTzBocyovbKolkWAIeikMkfZXu_sXnJ993tmIyA3aVcYZi2ke6K3kWKFLRj06f7zS1rAThdBj4jd8Hq-N7TfVWPsKsXUVd8JSLRY8pe9CX8J0y7sHTHpPKpdir5B_fZyAcCpCazN5ONu87mx553VF5V1LykytzHn7WnZaGuBbX0II11Vh3GFTrZ3xbtZTZNOrNyIIUFFZzQO2p'
  }
];

export const MOCK_SHORTS: VideoFile[] = [
  {
    id: 's1',
    name: 'summer_vibe_01.mp4',
    size: '12.4 MB',
    resolution: '9:16',
    status: 'Ready',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrg_IFsVC0lXyJP1nvX66lYekp66EmOBns_6s-cKwx1sdtX-mYs7TFKM6ioa18RNcADGnZYVZEYoZ-v-IWKHpU9xTc4pUD3-enL9OO-Pn-5pRLI8stcsRaDDbjK_aPNrRuBITM1qW9RIAvTDdL6XvYoreOyD3D6vyA1MK7pj7ORZon7PaAWpYJVyHx_t4L9sCxleH0yBce0y2lW2sDA51qK5cRyThM6-2v8OSMcFWnRPRbh-iQcURkqdvnWbLbmYXdMfDlMOt0ldni',
    duration: '0:45',
    progress: 100
  },
  {
    id: 's2',
    name: 'iphone15_review.mp4',
    size: '45.1 MB',
    resolution: '9:16',
    status: 'Uploading',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6Yze4F9A4TR7BTpGB9IgoN90r6MDFAsfXSWEnx3H0bBU8oXrzIDADcqVLZhUT_NO38y82N-1kYFmXB-zTVrftjRSVuAJfBx9-s1GktC_ka-Bc-T1iwmFbdsmT4ufR1QetrgAXJh63HpmsZhNefewZk7JMwTYIt7LvI5t7v-c3rZ9sqLMhJgz-hkiLoaeRg3dQe9gYA3TXU82RiQ7Ml4tw52x0POP2lHB1lJAC2Gwx84I4qdr-Th7_MofArXHzD2G3w1hDjOAPF-Z8',
    duration: '0:59',
    progress: 45
  },
  {
    id: 's3',
    name: 'tutorial_final.mp4',
    size: '8.2 MB',
    resolution: '9:16',
    status: 'Pending',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjERlCDSvZAkLDmaIzNvRqB7bAVCL81ViUfZSPWBXtorLnvKOHvTe2SpXIGiCaPDH3kibqMdKTd4EjaHLleaZqgQMdT22QieflkKYfP2DTQ2I1-M1N2KxNPUgJIp_R-HQxT7h_2Ya8T0Z_SnY54jFWNHPbUUOcAu-jZzInK_ViwJ4vD1Ejxy33w60HOz-TQDSg9YTK_Sg7CfOk8PlBBR6IiLUUMJPRL9l4Sz8cl6IlX8eqMnGB8wQ7WZtIWuzH4cx50DAShq3jAzqG',
    duration: '0:15'
  },
  {
    id: 's4',
    name: 'gaming_clip_4.mp4',
    size: '15.6 MB',
    resolution: '9:16',
    status: 'Ready',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhctMqMfFfRbalLE7wbJv00sKODVrPUjjkBwlZOCgD37ij_dccXEdMp2CaLzfkov9fcMQDThDFeSUiEwlx7QwI37gLLr4CHUMawSMCaH6w1bDSfpS6ApVU7-zuA7Pzo9L7NYm4R9l7wbVrDsn8_-DiA5wIMLG4sBQR5-PRUFVxRR2Nx9hNyXVI__g0EHxXkmuNnpx0cecuyYT28hJfLVRUylh-5yxxkn2L03YUE7EM5PO5d_mD5r7J6vNBT8yDcw05Aq-_py7Fs99n',
    duration: '0:30'
  }
];

export const MOCK_CHANNELS: Channel[] = [
  {
    id: 'c1',
    name: 'TechReview Pro',
    handle: '@techreview_official',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc0-SpwLZV3MQoRINUU1ci8rH8Jc22vNx_DPxNSipYsHj3RK0z55MrUe5A3IZp05haTaJ6uvtPTk6PMWLPqDiA9se-RqrJT5Pcf4qVphyQinJRNNNlylmuB7-uAsFtoXKUVGjl8p4RTvk70VBWMt-vv5hzF_D7SLByJwCrhh_25gw_p0isoRlpBHQlnwcmuh__IHwffU5y5Ph3_l6VyiQBxZAjqAkCdd7yMNjZ02F3dASBDJhbhVO2ZPaTfnQDezGMNM92QpARURh5',
    status: 'Connected',
    isActive: true
  },
  {
    id: 'c2',
    name: 'Gaming Daily',
    handle: '@dailygaminghub',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnCcoQF52q6sCCmfUBhRtWCPyL7gZYbKIwFXKx1LpMrLrmnbNvAZXa2FoNSqmN-zgSSonHPfroJtGkK8aZI4rO9iFNBkeYBOYSRU2VN6c52PTR51EH3FhbeGzf_qWmif6FAQ9NoNr0toLGdTBmoAlLx_qYrrRcpq1qVXEKdbPPwouilVWct0mqHxmCA5lwNfjRi6RhrHv7uBtO7kXVBZ19wsnNMHNmdKGV8BN7TQ-uwAVPta1asfvWzMpTT9MDLuJZOQ9AxhHh5vLn',
    status: 'Connected',
    isActive: false
  },
  {
    id: 'c3',
    name: 'Shorts Master',
    handle: '@quick_shorts',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJMTGu0eWM3LOVcbc9CzQbXvo7vlfbS8pmApRiMDE_hniqB8vlF-PIoYRa7C4aguDl96axsU2C9ktCELKVPkLsravcUKxUvWz1RLoXc01fIscGvvrF2_psD1xW4OzOFu_Wung1JSoApu3qhMxE7GygBe-s2qn3AawIK61iEKvl74H9QX9Jd87AmgXSxsAEU1FPYv9Gd3zOe-LXN5q1uw6D1_5axFNErZJHgIKm2Iv5W9r7PsZQPMQtaZ7GegSWblpWNM7z_uJbdJzX',
    status: 'Connected',
    isActive: false
  }
];

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'h1',
    title: '10 Minute Morning Yoga Routine',
    type: 'Video',
    channel: 'Zen Channel',
    channelAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvJY8nFqgcLwsnPjtBXkKaGITFS-4ehwoAhxKGtiZcP96C6bZjjYKazIhaKO1zW0Vg3mtqkssW2DXLoxfrBAZ6IXnoTqFqhf7l3OvEW_P4aPii4mY9feP8ikJ5c30UZzV1TiwmkJD2AKKr5eZIWxB2CRa2s4G_9L5zeDYaODzZiVEdPcFwbtMigOw7HE5601QG9rzL4WjJglmMAiKsUqSWDAiuKkTtmHPSeU6kTqIUnM6cKzIVdU4Y01DPSbj_rXND-d3WZGxKVSOl',
    scheduledDate: 'Oct 24, 2023',
    scheduledTime: '08:00 AM',
    status: 'Published',
    duration: '12:04',
    thumbnailColor: 'from-indigo-500/30 to-purple-500/30'
  },
  {
    id: 'h2',
    title: 'Best Gaming Headsets 2024 #shorts',
    type: 'Short',
    channel: 'Tech Hub',
    channelAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm0TlVUrnAj12Y3wdqRM8NvxQFghQh10OwCVQ-wTxg2OKzQWYWSW587NMyFXtJHCs_vUtsRT628ntnGWgWtJ__GvAsXSlw23XLeNV4OBQR7yAS1UvXWcIPJ_SH8pdK-H48KrN87chYjSIhqf_wuRsfvK-fzEQRym-VwAb2cBEtMHvsOphQKNt0KGanBqXTrGMJPLGXjYokXrkvd9i4N2r9fFH2nY8rSWtD4inpBk4EBOAHO9gcVZ3jTKFV_PKU-BdS5YEg_NOUsU5N',
    scheduledDate: 'Oct 26, 2023',
    scheduledTime: '02:30 PM',
    status: 'Scheduled',
    duration: '0:45',
    thumbnailColor: 'from-emerald-500/30 to-blue-500/30'
  },
  {
    id: 'h3',
    title: 'Quick 5-Min Smoothie Prep',
    type: 'Video',
    channel: 'Zen Channel',
    channelAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_gz68skHxkzQWAZIa1Db3nwewm_deKbSRW_I5jeuW6gn5cF4gli9nxl0Xc8a8l-I5H_VltUWzy_taRyEQWreZ2parno59hfk8b6w_5x31SfuQMYS9G9PZRz-r0HX2kfzli29cMp0ehUt5rdxYa6JZfZNcJZpxbNLYHqTfR3ib3vYXN7LrKtz2Ao-1YrH3NlyTBnOIyzYvtqfiBh1qp-chkU2RZ6G6Fkg1g1dMGtWUAnCxaRjPHbx_n_A3P7qnR8Hr-YNDHdIWXD4O',
    scheduledDate: 'Failed',
    scheduledTime: 'Network Timeout',
    status: 'Failed',
    duration: '15:30',
    thumbnailColor: 'from-rose-500/30 to-orange-500/30'
  }
];
