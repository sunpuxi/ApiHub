package config

import (
	"fmt"
	"os"

	"github.com/goccy/go-yaml"
)

type MySQLConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
	Database string `yaml:"database"`
}

type AsyncWorkerConfig struct {
	IntervalSeconds int `yaml:"interval_seconds"`
	LeaseMinutes    int `yaml:"lease_minutes"`
	MaxAttempts     int `yaml:"max_attempts"`
	BatchSize       int `yaml:"batch_size"`
}

type Config struct {
	MySQL       MySQLConfig       `yaml:"mysql"`
	DeepSeekKey string            `yaml:"deepseek_key"`
	AsyncWorker AsyncWorkerConfig `yaml:"async_worker"`
}

func LoadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("读取配置文件失败: %w", err)
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("解析配置文件失败: %w", err)
	}

	return &config, nil
}

// NormalizeAsyncWorker fills zero values so a partial YAML still works.
func (c *Config) NormalizeAsyncWorker() {
	if c.AsyncWorker.IntervalSeconds <= 0 {
		c.AsyncWorker.IntervalSeconds = 10
	}
	if c.AsyncWorker.LeaseMinutes <= 0 {
		c.AsyncWorker.LeaseMinutes = 8
	}
	if c.AsyncWorker.MaxAttempts <= 0 {
		c.AsyncWorker.MaxAttempts = 5
	}
	if c.AsyncWorker.BatchSize <= 0 {
		c.AsyncWorker.BatchSize = 5
	}
}

func (c *MySQLConfig) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.Username, c.Password, c.Host, c.Port, c.Database)
}
